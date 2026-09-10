import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { syncUserCart } from "@/lib/abandoned-cart";
import { checkOrigin } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/cart/sync — miroir serveur du panier des clients connectés.
 *
 * Le panier reste côté navigateur (source de vérité pour l'affichage) ; cet
 * appel permet au serveur de connaître son contenu afin de pouvoir relancer un
 * panier abandonné. Réservé aux utilisateurs authentifiés : aucun visiteur
 * anonyme n'est relancé.
 *
 * Seuls `productId` et `quantity` sont acceptés, et les identifiants inconnus
 * sont écartés — voir `normalizeCartLines`.
 */
export async function POST(req: Request) {
  if (!(await checkOrigin())) {
    return NextResponse.json({ ok: false, error: "Origine non autorisée." }, { status: 403 });
  }

  const user = await getCurrentUser();
  if (!user) {
    // Pas une erreur : les visiteurs non connectés ont simplement un panier
    // purement local. On répond 204 pour ne pas polluer la console.
    return new NextResponse(null, { status: 204 });
  }

  if (!(await rateLimit(`cart-sync:${user.id}`, 60, 60_000))) {
    return NextResponse.json({ ok: false, error: "Trop de requêtes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Corps de requête invalide." }, { status: 400 });
  }

  const rawLines = (body as { lines?: unknown } | null)?.lines;

  try {
    const { lines } = await syncUserCart(user.id, rawLines);
    return NextResponse.json({ ok: true, lines }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    log.warn("cart.sync_failed", { userId: user.id, reason: e instanceof Error ? e.message : "unknown" });
    return NextResponse.json({ ok: false, error: "Synchronisation impossible." }, { status: 500 });
  }
}
