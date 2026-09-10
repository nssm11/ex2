import { NextResponse } from "next/server";
import { runAbandonedCartReminders } from "@/lib/abandoned-cart";
import { env } from "@/lib/env";
import { safeEqual } from "@/lib/orders";
import { clientKey } from "@/lib/origin";
import { rateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * Tâche planifiée — relance des paniers abandonnés.
 *
 * Mécanisme compatible serverless : aucun état en mémoire, aucun `setTimeout`
 * côté client. La file est entièrement en base (table `carts`) et ce point
 * d'entrée se contente de la relever. En production, un cron externe appelle
 * cette URL (Vercel Cron, GitHub Actions, crontab, système de file…) à
 * intervalles réguliers — une fois par minute pour un délai de relance de 60 s.
 *
 * Exemple pour tester localement :
 *   curl "http://localhost:3000/api/cron/abandoned-carts" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * La relevée est idempotente : la relancer ne renvoie jamais deux fois le même
 * rappel (prise de possession atomique dans `runAbandonedCartReminders`).
 */
async function authorized(req: Request): Promise<boolean> {
  if (!env.CRON_SECRET) return false;
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const query = new URL(req.url).searchParams.get("secret") ?? "";
  return safeEqual(bearer, env.CRON_SECRET) || safeEqual(query, env.CRON_SECRET);
}

async function handle(req: Request) {
  if (!(await rateLimit(`cron:${await clientKey()}`, 30, 60_000))) {
    return NextResponse.json({ ok: false, error: "Trop de requêtes." }, { status: 429 });
  }
  if (!(await authorized(req))) {
    return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }

  try {
    const report = await runAbandonedCartReminders();
    log.info("abandoned_cart.run", { scanned: report.scanned, sent: report.sent });
    return NextResponse.json({ ok: true, ...report }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    log.error("abandoned_cart.run_failed", { reason: e instanceof Error ? e.message : "unknown" });
    return NextResponse.json({ ok: false, error: "Traitement impossible." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
