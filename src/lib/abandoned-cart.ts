import "server-only";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { carts, orders, products, users, type CartLineRef } from "@/db/schema";
import { sendAbandonedCartReminder } from "@/lib/email";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { MAX_CART_QTY } from "@/lib/cart";
import { safeStock } from "@/lib/stock";

/**
 * Relance de panier abandonné.
 *
 * Le panier vit dans le navigateur ; cette table en est le miroir serveur,
 * alimenté par `POST /api/cart/sync`. Le traitement est piloté par une tâche
 * planifiée (`GET /api/cron/abandoned-carts`) : rien ne dépend d'un
 * `setTimeout` côté client, ni d'un processus applicatif qui resterait vivant.
 */

const MAX_LINES = 50;

/* ── Normalisation ─────────────────────────────────────────────── */

/**
 * N'accepte du client que `productId` et `quantity`. Tout le reste
 * (libellé, image, prix) est relu depuis la base : le contenu du courriel ne
 * dépend donc jamais d'une valeur fournie par le navigateur.
 */
export function normalizeCartLines(raw: unknown): CartLineRef[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map<number, number>();
  for (const item of raw.slice(0, MAX_LINES)) {
    if (!item || typeof item !== "object") continue;
    const productId = Number((item as { productId?: unknown }).productId);
    const quantity = Number((item as { quantity?: unknown }).quantity);
    if (!Number.isInteger(productId) || productId <= 0) continue;
    if (!Number.isFinite(quantity)) continue;
    const qty = Math.max(1, Math.min(MAX_CART_QTY, Math.round(quantity)));
    byId.set(productId, qty);
  }
  return [...byId].map(([productId, quantity]) => ({ productId, quantity }));
}

/* ── Synchronisation ───────────────────────────────────────────── */

/**
 * Enregistre l'état courant du panier d'un client connecté.
 * Chaque appel repousse `updatedAt`, donc repousse la relance.
 */
export async function syncUserCart(userId: number, raw: unknown): Promise<{ lines: number }> {
  const requested = normalizeCartLines(raw);
  let lines: CartLineRef[] = [];

  if (requested.length) {
    const rows = await db
      .select({ id: products.id })
      .from(products)
      .where(inArray(products.id, requested.map((l) => l.productId)));
    const known = new Set(rows.map((r) => r.id));
    lines = requested.filter((l) => known.has(l.productId));
  }

  const now = new Date();
  await db
    .insert(carts)
    .values({ userId, lines, updatedAt: now })
    .onConflictDoUpdate({ target: carts.userId, set: { lines, updatedAt: now } });

  return { lines: lines.length };
}

/**
 * À appeler après une commande réussie : le panier est converti, plus aucune
 * relance ne doit partir pour l'abandon en cours.
 */
export async function markCartConverted(userId: number): Promise<void> {
  try {
    await db
      .update(carts)
      .set({ lines: [], updatedAt: new Date(), remindedAt: new Date() })
      .where(eq(carts.userId, userId));
  } catch (e) {
    log.warn("abandoned_cart.converted_failed", { userId, reason: e instanceof Error ? e.message : "unknown" });
  }
}

/* ── Traitement de la file ─────────────────────────────────────── */

export type ReminderRunReport = {
  scanned: number;
  sent: number;
  skipped: { reason: string; userId?: number }[];
  failures: { userId: number; reason: string }[];
};

/**
 * Relève les paniers échus et envoie les relances.
 *
 * Pour chaque panier, quatre vérifications sont refaites côté serveur juste
 * avant l'envoi — l'état a pu changer entre la relève et l'envoi :
 *   1. le panier contient toujours des articles ;
 *   2. aucune commande n'a été passée depuis la dernière modification ;
 *   3. le panier n'a pas été vidé (recouvert par 1) ;
 *   4. aucune relance n'a déjà été envoyée pour cet abandon.
 *
 * Le point 4 est garanti sans contention par un `UPDATE … WHERE … RETURNING`
 * conditionnel : un seul exécutant remporte la relance, les autres ne voient
 * aucune ligne et passent leur chemin.
 */
export async function runAbandonedCartReminders(limit = 50): Promise<ReminderRunReport> {
  const delaySeconds = env.ABANDONED_CART_DELAY_SECONDS;
  const dueBefore = new Date(Date.now() - delaySeconds * 1000);
  const report: ReminderRunReport = { scanned: 0, sent: 0, skipped: [], failures: [] };

  const due = await db
    .select({ id: carts.id, userId: carts.userId, updatedAt: carts.updatedAt })
    .from(carts)
    .where(
      and(
        sql`jsonb_array_length(${carts.lines}) > 0`,
        sql`${carts.updatedAt} <= ${dueBefore}`,
        sql`(${carts.remindedAt} IS NULL OR ${carts.remindedAt} < ${carts.updatedAt})`,
      ),
    )
    .orderBy(carts.updatedAt)
    .limit(limit);

  report.scanned = due.length;

  for (const cart of due) {
    // Prise de possession atomique : on n'envoie que si l'on remporte l'UPDATE.
    const claimed = await db
      .update(carts)
      .set({ remindedAt: new Date() })
      .where(
        and(
          eq(carts.id, cart.id),
          sql`jsonb_array_length(${carts.lines}) > 0`,
          sql`(${carts.remindedAt} IS NULL OR ${carts.remindedAt} < ${carts.updatedAt})`,
        ),
      )
      .returning({ id: carts.id });

    if (!claimed.length) {
      report.skipped.push({ reason: "already_reminded_or_changed", userId: cart.userId });
      continue;
    }

    try {
      // 1 & 3 : relire l'état réel après la prise de possession.
      const [row] = await db.select({ lines: carts.lines }).from(carts).where(eq(carts.id, cart.id)).limit(1);
      const refs = (row?.lines ?? []).filter((l) => l && Number.isInteger(l.productId) && l.quantity > 0);
      if (!refs.length) {
        report.skipped.push({ reason: "cart_empty", userId: cart.userId });
        continue;
      }

      // 2 : commander annule la relance.
      const ordered = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.userId, cart.userId), gte(orders.createdAt, cart.updatedAt)))
        .limit(1);
      if (ordered.length) {
        report.skipped.push({ reason: "order_completed", userId: cart.userId });
        continue;
      }

      const [user] = await db
        .select({ id: users.id, email: users.email, firstName: users.firstName })
        .from(users)
        .where(eq(users.id, cart.userId))
        .limit(1);
      if (!user) {
        report.skipped.push({ reason: "user_missing", userId: cart.userId });
        continue;
      }

      // Contenu reconstruit depuis la base : prix et libellés font foi.
      const rows = await db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          image: products.image,
          brandId: products.brandId,
          price: products.priceMillimes,
          stock: products.stock,
          status: products.status,
        })
        .from(products)
        .where(inArray(products.id, refs.map((r) => r.productId)));
      const byId = new Map(rows.map((r) => [r.id, r]));
      const brandRows = rows.some((r) => r.brandId)
        ? await db.execute(sql`SELECT id, name FROM brands`)
        : { rows: [] as { id: number; name: string }[] };
      const brandName = new Map((brandRows.rows as { id: number; name: string }[]).map((b) => [b.id, b.name]));

      const lines = refs
        .map((ref) => {
          const p = byId.get(ref.productId);
          if (!p || p.status !== "active") return null;
          // On ne relance pas sur un article devenu indisponible entre-temps.
          if (safeStock(p.stock) <= 0) return null;
          return {
            slug: p.slug,
            name: p.name,
            brandName: p.brandId ? brandName.get(p.brandId) ?? null : null,
            image: p.image ?? null,
            quantity: ref.quantity,
            unitPriceMillimes: p.price,
            lineTotalMillimes: p.price * ref.quantity,
          };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null);

      if (!lines.length) {
        report.skipped.push({ reason: "no_available_products", userId: cart.userId });
        continue;
      }

      const subtotal = lines.reduce((sum, l) => sum + l.lineTotalMillimes, 0);

      const result = await sendAbandonedCartReminder({ email: user.email, firstName: user.firstName, lines, subtotal });

      if (result.ok) {
        report.sent += 1;
      } else {
        // Échec d'envoi : on libère la relance pour qu'une exécution ultérieure
        // réessaie (panne Resend passagère) au lieu de perdre le rappel.
        await db.update(carts).set({ remindedAt: null }).where(eq(carts.id, cart.id));
        report.failures.push({ userId: cart.userId, reason: result.reason });
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message : "unknown";
      log.error("abandoned_cart.processing_failed", { userId: cart.userId, reason });
      await db.update(carts).set({ remindedAt: null }).where(eq(carts.id, cart.id)).catch(() => {});
      report.failures.push({ userId: cart.userId, reason });
    }
  }

  return report;
}
