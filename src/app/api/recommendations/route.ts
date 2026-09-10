import { NextResponse, type NextRequest } from "next/server";
import { recommend } from "@/lib/recommendations";
import { rateLimit } from "@/lib/rate-limit";
import { clientKey } from "@/lib/origin";

export const dynamic = "force-dynamic";

/**
 * Recommendations for the products currently in the cart (or the product being
 * viewed). The ranking runs server-side against the real catalogue, so the
 * suggestions follow the customer's actual selection instead of a fixed shelf.
 */
export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 12);

  if (!ids.length) return NextResponse.json({ items: [] });

  // Public endpoint: cap abuse without blocking legitimate shoppers.
  if (!(await rateLimit(`reco:${await clientKey()}`, 60, 60_000))) {
    return NextResponse.json({ items: [] }, { status: 429 });
  }

  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 3, 1), 8);
  const items = await recommend(ids, limit);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "private, max-age=60" } });
}
