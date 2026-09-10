import "server-only";
import { and, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, productConcerns, products } from "@/db/schema";
import { productCardSelect, publiclyVisible, type ProductCard } from "./catalog";
import { isInStock } from "./stock";

/**
 * Product recommendations.
 *
 * Relevance is computed from the catalogue's own structure — universe,
 * sub-category, brand, concerns, attributes and price — so a recommendation is
 * derived from real data rather than a hand-written list: a shampooing suggests
 * its après-shampooing, a sunscreen its après-soleil, a serum the cream of the
 * same range. The weights below are the only opinions in this file.
 *
 * Rules that always hold:
 *  - the seed products themselves are never recommended back;
 *  - products that cannot be bought (stock 0 / null, draft, archived) are
 *    pushed to the end rather than removed, so a thin catalogue still fills the
 *    shelf instead of showing an empty rail.
 */

export type Seed = {
  id: number;
  categoryId: number | null;
  universeId: number | null;
  brandId: number | null;
  priceMillimes: number;
  concernIds: number[];
  /** Significant words from the name, used for attribute-level matching. */
  tokens: string[];
};

type Candidate = {
  id: number;
  name: string;
  categoryId: number | null;
  universeId: number | null;
  brandId: number | null;
  priceMillimes: number;
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  ratingAvg: number;
  salesCount: number;
  concerns: number[];
};

/* ── Weights ─────────────────────────────────────────────────────────────── */
const W = {
  sameCategory: 70, // strongest signal: same sub-category
  sameUniverse: 25, // same universe (Visage, Solaire, Compléments…)
  sameBrand: 10,
  sharedConcern: 12, // per shared concern…
  sharedConcernCap: 24, // …capped
  complementary: 34, // a product meant to be used alongside the seed
  tokenOverlap: 4, // shared attribute word ("Anti-chute", "Cica"…)
  tokenOverlapCap: 12,
  priceProximityMax: 12,
  inStock: 6,
  outOfStock: -40, // do not recommend what cannot be bought
  featured: 3,
  isNew: 2,
  breadth: 6, // bonus per *extra* cart product this candidate relates to
  popularityCap: 6,
};

/**
 * Complementary sub-categories, keyed by the slug already stored in
 * `categories`. This is catalogue-level knowledge ("what goes with what"), not
 * a per-product hardcode, so every product in a sub-category inherits it and
 * new products are covered automatically.
 */
const COMPLEMENTARY: Record<string, string[]> = {
  // Visage
  "nettoyants-demaquillants": ["serums", "hydratants", "peaux-a-imperfections"],
  serums: ["hydratants", "anti-age", "contour-des-yeux", "nettoyants-demaquillants"],
  hydratants: ["serums", "nettoyants-demaquillants", "anti-age", "peaux-a-imperfections"],
  "anti-age": ["serums", "contour-des-yeux", "hydratants"],
  "contour-des-yeux": ["serums", "anti-age", "hydratants"],
  "peaux-a-imperfections": ["nettoyants-demaquillants", "hydratants"],
  // Corps
  "hydratants-corps": ["douche-bain", "mains-pieds", "vergetures-fermete"],
  "douche-bain": ["hydratants-corps", "mains-pieds", "deodorants"],
  "mains-pieds": ["hydratants-corps", "douche-bain"],
  "vergetures-fermete": ["hydratants-corps", "soins-maman"],
  // Cheveux
  shampooings: ["apres-shampooings-masques", "anti-chute", "cuir-chevelu-sensible"],
  "apres-shampooings-masques": ["shampooings", "anti-chute"],
  "anti-chute": ["shampooings", "cuir-chevelu-sensible", "beaute-in-out"],
  "cuir-chevelu-sensible": ["shampooings", "apres-shampooings-masques"],
  // Solaire
  "protection-visage": ["protection-corps", "apres-soleil", "hydratants"],
  "protection-corps": ["protection-visage", "apres-soleil", "hydratants-corps"],
  "apres-soleil": ["protection-corps", "protection-visage", "hydratants-corps"],
  enfants: ["protection-corps", "toilette-bebe"],
  // Bébé & Maman
  "toilette-bebe": ["change", "soins-maman", "hydratants-corps"],
  change: ["toilette-bebe", "soins-maman"],
  "soins-maman": ["vergetures-fermete", "toilette-bebe", "hydratants-corps"],
  // Compléments
  "vitalite-immunite": ["beaute-in-out", "digestion", "sommeil-stress"],
  "sommeil-stress": ["vitalite-immunite", "digestion"],
  "beaute-in-out": ["vitalite-immunite", "anti-chute"],
  digestion: ["vitalite-immunite", "sommeil-stress"],
  // Hygiène
  "bucco-dentaire": ["hygiene-intime", "deodorants"],
  "hygiene-intime": ["deodorants", "bucco-dentaire"],
  deodorants: ["hygiene-intime", "douche-bain"],
  "premiers-soins": ["mains-pieds", "hydratants-corps"],
};

const STOPWORDS = new Set([
  "le", "la", "les", "de", "des", "du", "un", "une", "et", "en", "pour", "avec", "sans",
  "peau", "peaux", "visage", "corps", "cheveux", "ml", "spf", "spf50", "spf30", "100", "150",
  "200", "250", "300", "400", "500", "50", "40", "30", "20", "15",
]);

/** Significant lowercase words of a product name, used for attribute matching. */
export function nameTokens(name: string | null | undefined): string[] {
  if (!name) return [];
  return [
    ...new Set(
      name
        .toLowerCase()
        .split(/[^a-z0-9à-ÿ]+/i)
        .filter((t) => t.length >= 3 && !STOPWORDS.has(t)),
    ),
  ];
}

function scorePair(seed: Seed, c: Candidate, slugs: Map<number, string>): number {
  let s = 0;

  if (seed.categoryId && c.categoryId === seed.categoryId) s += W.sameCategory;
  if (seed.universeId && c.universeId === seed.universeId) s += W.sameUniverse;
  if (seed.brandId && c.brandId === seed.brandId) s += W.sameBrand;

  // Shared concerns (peau sensible, chute de cheveux, protection solaire…)
  if (seed.concernIds.length && c.concerns.length) {
    const shared = c.concerns.filter((id) => seed.concernIds.includes(id)).length;
    s += Math.min(W.sharedConcernCap, shared * W.sharedConcern);
  }

  // Complementary sub-categories — the "accessories" of the seed product.
  const seedSlug = seed.categoryId ? slugs.get(seed.categoryId) : undefined;
  const candSlug = c.categoryId ? slugs.get(c.categoryId) : undefined;
  if (seedSlug && candSlug && COMPLEMENTARY[seedSlug]?.includes(candSlug)) s += W.complementary;

  // Attribute-level similarity ("Anti-chute", "Nutritif", "Cica"…).
  if (seed.tokens.length) {
    const candTokens = nameTokens(c.name);
    const shared = candTokens.filter((t) => seed.tokens.includes(t)).length;
    s += Math.min(W.tokenOverlapCap, shared * W.tokenOverlap);
  }

  // Same price bracket — a useful "similar product" signal.
  const delta = Math.abs(c.priceMillimes - seed.priceMillimes) / Math.max(seed.priceMillimes, 1);
  s += Math.round(W.priceProximityMax * Math.max(0, 1 - Math.min(1, delta)));

  // Buyability dominates: never push a sold-out product over an available one.
  s += isInStock(c.stock) ? W.inStock : W.outOfStock;

  // Tie-breakers only — they must never outrank a real relevance signal.
  s += Math.min(W.popularityCap, c.salesCount / 20) + (c.ratingAvg / 100) * 2;
  if (c.isFeatured) s += W.featured;
  if (c.isNew) s += W.isNew;

  return s;
}

/** `id -> slug` for every category. Cheap (a few dozen rows) and cacheable. */
let slugCache: Map<number, string> | null = null;
async function categorySlugs(): Promise<Map<number, string>> {
  if (!slugCache) {
    const rows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
    slugCache = new Map(rows.map((r) => [r.id, r.slug]));
  }
  return slugCache;
}

const candidateSelect = {
  id: products.id,
  name: products.name,
  categoryId: products.categoryId,
  universeId: products.universeId,
  brandId: products.brandId,
  priceMillimes: products.priceMillimes,
  stock: products.stock,
  isFeatured: products.isFeatured,
  isNew: products.isNew,
  ratingAvg: products.ratingAvg,
  salesCount: products.salesCount,
};

async function loadCandidates(seeds: Seed[], exclude: number[], needed: number): Promise<Candidate[]> {
  const universeIds = [...new Set(seeds.map((s) => s.universeId).filter((x): x is number => !!x))];
  const categoryIds = [...new Set(seeds.map((s) => s.categoryId).filter((x): x is number => !!x))];
  const brandIds = [...new Set(seeds.map((s) => s.brandId).filter((x): x is number => !!x))];

  const excluded = exclude.length
    ? sql`${products.id} NOT IN (${sql.join(exclude.map((id) => sql`${id}`), sql`, `)})`
    : undefined;
  const base = and(publiclyVisible, excluded);

  // First pass: the aisles that matter (same universe / sub-category / brand).
  const targeted: SQL[] = [];
  if (universeIds.length) targeted.push(inArray(products.universeId, universeIds));
  if (categoryIds.length) targeted.push(inArray(products.categoryId, categoryIds));
  if (brandIds.length) targeted.push(inArray(products.brandId, brandIds));

  let pool = targeted.length
    ? await db
        .select(candidateSelect)
        .from(products)
        .where(and(base, sql`(${sql.join(targeted, sql` OR `)})`))
        .orderBy(desc(products.salesCount))
        .limit(120)
    : [];

  // Second pass: not enough peers in those aisles — widen to the catalogue.
  if (pool.length < needed) {
    const extra = await db
      .select(candidateSelect)
      .from(products)
      .where(base)
      .orderBy(desc(products.salesCount))
      .limit(120);
    const seen = new Set(pool.map((r) => r.id));
    pool = [...pool, ...extra.filter((r) => !seen.has(r.id))];
  }

  if (!pool.length) return [];

  const concernRows = await db
    .select({ productId: productConcerns.productId, concernId: productConcerns.concernId })
    .from(productConcerns)
    .where(
      inArray(
        productConcerns.productId,
        pool.map((p) => p.id),
      ),
    );
  const byProduct = new Map<number, number[]>();
  for (const r of concernRows) {
    const list = byProduct.get(r.productId) ?? [];
    list.push(r.concernId);
    byProduct.set(r.productId, list);
  }

  return pool.map((p) => ({ ...p, concerns: byProduct.get(p.id) ?? [] }));
}

/**
 * Recommendations for one or several products (a product page, or the contents
 * of a cart). Returns fully-formed product cards in relevance order.
 */
export async function recommend(seedIds: number[], limit = 4): Promise<ProductCard[]> {
  const ids = [...new Set(seedIds.filter((n) => Number.isInteger(n) && n > 0))].slice(0, 12);
  if (!ids.length) return [];

  const [seedRows, slugMap] = await Promise.all([
    db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        universeId: products.universeId,
        brandId: products.brandId,
        priceMillimes: products.priceMillimes,
        name: products.name,
      })
      .from(products)
      .where(inArray(products.id, ids)),
    categorySlugs(),
  ]);
  if (!seedRows.length) return [];

  const seedConcerns = await db
    .select({ productId: productConcerns.productId, concernId: productConcerns.concernId })
    .from(productConcerns)
    .where(
      inArray(
        productConcerns.productId,
        seedRows.map((r) => r.id),
      ),
    );
  const concernsBySeed = new Map<number, number[]>();
  for (const r of seedConcerns) {
    const list = concernsBySeed.get(r.productId) ?? [];
    list.push(r.concernId);
    concernsBySeed.set(r.productId, list);
  }

  const seeds: Seed[] = seedRows.map((r) => ({
    id: r.id,
    categoryId: r.categoryId,
    universeId: r.universeId,
    brandId: r.brandId,
    priceMillimes: r.priceMillimes,
    concernIds: concernsBySeed.get(r.id) ?? [],
    tokens: nameTokens(r.name),
  }));

  const candidates = await loadCandidates(seeds, seeds.map((s) => s.id), limit);
  if (!candidates.length) return [];

  const isComplement = (seed: Seed, c: Candidate) => {
    const seedSlug = seed.categoryId ? slugMap.get(seed.categoryId) : undefined;
    const candSlug = c.categoryId ? slugMap.get(c.categoryId) : undefined;
    return !!(seedSlug && candSlug && COMPLEMENTARY[seedSlug]?.includes(candSlug));
  };

  /** Global score: best match against any seed, plus a breadth bonus. */
  const globalScore = new Map<number, number>();
  for (const c of candidates) {
    let best = -Infinity;
    let strongHits = 0;
    for (const seed of seeds) {
      const score = scorePair(seed, c, slugMap);
      if (score >= 50) strongHits += 1;
      if (score > best) best = score;
    }
    // Rewards a product that relates to *several* items already in the cart.
    globalScore.set(c.id, best + Math.max(0, strongHits - 1) * W.breadth);
  }

  /**
   * Order for a single seed: alternate a complement (the "accessory" of what
   * was chosen) with a close alternative, so the shelf reads "finish your
   * routine" instead of the same product four times.
   */
  const orderForSeed = (seed: Seed, pool: Candidate[]): number[] => {
    const rows = pool
      .map((c) => ({ c, score: scorePair(seed, c, slugMap), complementary: isComplement(seed, c) }))
      .sort((a, b) => b.score - a.score);
    const complements = rows.filter((r) => r.complementary);
    const similars = rows.filter((r) => !r.complementary);
    const out: number[] = [];
    for (let i = 0; i < Math.max(complements.length, similars.length); i += 1) {
      if (complements[i]) out.push(complements[i].c.id);
      if (similars[i]) out.push(similars[i].c.id);
    }
    return out;
  };

  /**
   * Round-robin across seeds so every product in the cart is represented;
   * within a round, the breadth bonus decides the order.
   */
  const mergeSeeds = (pool: Candidate[]): number[] => {
    if (!pool.length) return [];
    const perSeed = seeds.map((seed) => orderForSeed(seed, pool));
    const depth = Math.max(...perSeed.map((l) => l.length));
    const seen = new Set<number>();
    const out: number[] = [];
    for (let i = 0; i < depth; i += 1) {
      const round = perSeed
        .map((list) => list[i])
        .filter((id): id is number => id !== undefined && !seen.has(id))
        .sort((a, b) => (globalScore.get(b) ?? 0) - (globalScore.get(a) ?? 0));
      for (const id of round) {
        if (seen.has(id) || out.includes(id)) continue;
        seen.add(id);
        out.push(id);
      }
    }
    return out;
  };

  // Available products fill the shelf first; sold-out ones only take the
  // remaining slots so the rail is never empty when the catalogue is thin.
  const availablePool = candidates.filter((c) => isInStock(c.stock));
  const ranked = [
    ...mergeSeeds(availablePool),
    ...mergeSeeds(candidates.filter((c) => !isInStock(c.stock))),
  ].slice(0, limit);

  if (!ranked.length) return [];

  const rows = await db
    .select(productCardSelect)
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(publiclyVisible, inArray(products.id, ranked)));

  const byId = new Map(rows.map((r) => [r.id, r as ProductCard]));
  const ordered = ranked.map((id) => byId.get(id)).filter((x): x is ProductCard => !!x);

  // Available products first; sold-out ones are kept but demoted, so the rail
  // is never empty when the catalogue is thin.
  return [...ordered.filter((p) => isInStock(p.stock)), ...ordered.filter((p) => !isInStock(p.stock))];
}

/** Recommendations for a product detail page. */
export async function getRelatedProducts(productId: number, limit = 4): Promise<ProductCard[]> {
  return recommend([productId], limit);
}

/** Fallback shelf — used when the customer has nothing in the cart yet. */
export async function getPopularProducts(limit = 3): Promise<ProductCard[]> {
  const rows = await db
    .select(productCardSelect)
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(publiclyVisible, sql`${products.stock} > 0`))
    .orderBy(desc(products.salesCount), desc(products.isFeatured))
    .limit(limit);
  return rows as ProductCard[];
}
