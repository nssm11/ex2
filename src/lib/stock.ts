/**
 * Stock rules shared by the server (pages, API, checkout) and the client
 * (product cards, buy box, cart).
 *
 * Historically every call site re-derived "is this product sold out?" with
 * `stock <= 0`. That silently mis-handles the nullish values that do occur in
 * practice — a cart line restored from an older `localStorage` payload, a row
 * joined without its inventory counterpart, a payload from an admin form — so
 * the same product could look available in one place and unavailable in
 * another. Everything now goes through these helpers, which treat an unknown
 * stock as "sold out" (the only safe default: we must never promise stock we
 * cannot prove) without ever throwing.
 */

/** Coerce anything (null, undefined, "12", NaN, -3) into a sane stock count. */
export function safeStock(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

/** A product can be added to the cart only when we can prove stock exists. */
export function isInStock(value: unknown): boolean {
  return safeStock(value) > 0;
}

/** Mirror of {@link isInStock} — kept explicit so call sites read naturally. */
export function isOutOfStock(value: unknown): boolean {
  return !isInStock(value);
}

/**
 * "Only a few left" — never true for a sold-out product, and never true when
 * the threshold itself is missing.
 */
export function isLowStock(value: unknown, threshold: unknown): boolean {
  const stock = safeStock(value);
  if (stock <= 0) return false;
  const t = safeStock(threshold);
  return t > 0 && stock <= t;
}

/** Upper bound for a quantity stepper: at least 1, never NaN, never > cap. */
export function maxPurchasable(value: unknown, cap = 20): number {
  const stock = safeStock(value);
  if (stock <= 0) return 1;
  return Math.max(1, Math.min(cap, stock));
}

/** Short, user-facing stock sentence (French). */
export function stockLabel(value: unknown, threshold: unknown): string {
  if (isOutOfStock(value)) return "Rupture de stock";
  if (isLowStock(value, threshold)) return `Plus que ${safeStock(value)} en stock`;
  return "En stock";
}
