import "server-only";
import { and, asc, desc, eq, gte, inArray, isNotNull, lte, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { brands, categories, concerns, productConcerns, products, reviews } from "@/db/schema";
import { ACCENTED, FOLDED, foldText, likePattern, searchTokens } from "./text";

/**
 * Single source of truth for "may this product be seen by the public?".
 * Every public read path (listing, search, related, feeds, `/api/products`)
 * must include this — filtering by hand at each call site is how draft and
 * archived products end up leaking behind a known id.
 * Admin screens query `products` directly and are NOT affected.
 */
export const publiclyVisible = eq(products.status, "active");



export const productCardSelect = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  shortDescription: products.shortDescription,
  priceMillimes: products.priceMillimes,
  compareAtMillimes: products.compareAtMillimes,
  stock: products.stock,
  lowStockThreshold: products.lowStockThreshold,
  image: products.image,
  volume: products.volume,
  isNew: products.isNew,
  ratingAvg: products.ratingAvg,
  ratingCount: products.ratingCount,
  brandName: brands.name,
  brandSlug: brands.slug,
};
export type ProductCard = {
  id: number; slug: string; name: string; shortDescription: string | null; priceMillimes: number;
  compareAtMillimes: number | null; stock: number; lowStockThreshold: number; image: string | null; volume: string | null;
  isNew: boolean; ratingAvg: number; ratingCount: number; brandName: string | null; brandSlug: string | null;
};

export type SortKey = "featured" | "price_asc" | "price_desc" | "newest" | "rating" | "bestsellers";
export type ListFilters = {
  q?: string;
  universeId?: number;
  categoryId?: number;
  categoryIds?: number[];
  brandSlugs?: string[];
  concernSlugs?: string[];
  concernId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  promo?: boolean;
  minRating?: number;
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

/**
 * Accent-insensitive search without the `unaccent` extension.
 *
 * `unaccent` is not created by `drizzle-kit push` and is often unavailable on a
 * managed database, and then every search raised
 * `function unaccent(character varying) does not exist` — which is why the
 * search bar appeared broken. The fold is done with `translate` instead: the
 * tables in `lib/text` are applied to the user input in JS and to the columns
 * in SQL, so "serum" finds "Sérum" on any PostgreSQL.
 */
type TextLike = SQL | AnyColumn;
/** SQL twin of `foldText` from `lib/text` — same tables, applied to a column. */
const foldColumn = (col: TextLike): SQL =>
  sql`lower(translate(coalesce(${col}::text, ''), ${ACCENTED}, ${FOLDED}))`;

/** Everything a query may match against, folded into one haystack. */
function searchHaystack(): SQL {
  return sql`${foldColumn(products.name)} || ' ' || ${foldColumn(products.shortDescription)} || ' ' ||
    ${foldColumn(sql`(select b.name from ${brands} b where b.id = ${products.brandId})`)} || ' ' ||
    ${foldColumn(sql`(select c.name from ${categories} c where c.id = ${products.categoryId})`)} || ' ' ||
    ${foldColumn(sql`(select u.name from ${categories} u where u.id = ${products.universeId})`)} || ' ' ||
    ${foldColumn(products.sku)}`;
}

/** AND across tokens, so "crème solaire" is not "every cream in the shop". */
function searchWhere(q: string): SQL | undefined {
  const tokens = searchTokens(q);
  if (!tokens.length) return undefined;
  const haystack = searchHaystack();
  return sql`(${sql.join(tokens.map((t) => sql`${haystack} LIKE ${likePattern(t)}`), sql` AND `)})`;
}

function baseWhere(f: ListFilters): SQL[] {
  const w: SQL[] = [publiclyVisible];
  if (f.q) {
    const match = searchWhere(f.q);
    if (match) w.push(match);
  }
  if (f.universeId) w.push(eq(products.universeId, f.universeId));
  if (f.categoryId) w.push(eq(products.categoryId, f.categoryId));
  if (f.categoryIds?.length) w.push(inArray(products.categoryId, f.categoryIds));
  if (f.brandId) w.push(eq(products.brandId, f.brandId));
  if (f.brandSlugs?.length) w.push(inArray(brands.slug, f.brandSlugs));
  if (f.minPrice) w.push(gte(products.priceMillimes, f.minPrice));
  if (f.maxPrice) w.push(lte(products.priceMillimes, f.maxPrice));
  if (f.inStock) w.push(sql`${products.stock} > 0`);
  if (f.promo) w.push(and(isNotNull(products.compareAtMillimes), sql`${products.compareAtMillimes} > ${products.priceMillimes}`)!);
  if (f.minRating) w.push(gte(products.ratingAvg, f.minRating * 100));
  if (f.concernId) {
    w.push(sql`${products.id} IN (SELECT product_id FROM product_concerns WHERE concern_id = ${f.concernId})`);
  }
  if (f.concernSlugs?.length) {
    w.push(
      sql`${products.id} IN (SELECT pc.product_id FROM product_concerns pc JOIN concerns c ON c.id = pc.concern_id WHERE c.slug IN ${f.concernSlugs})`,
    );
  }
  return w;
}

function orderBy(sort: SortKey = "featured", q?: string): SQL[] {
  switch (sort) {
    case "price_asc": return [asc(products.priceMillimes)];
    case "price_desc": return [desc(products.priceMillimes)];
    case "newest": return [desc(products.createdAt)];
    case "rating": return [desc(products.ratingAvg), desc(products.ratingCount)];
    case "bestsellers": return [desc(products.salesCount)];
    default: {
      // With a search term and no explicit sort, relevance beats "featured":
      // the best match must come first or the results look random.
      if (q?.trim()) {
        const folded = foldText(q.trim());
        const nameFolded = foldColumn(products.name);
        return [
          sql`case when ${nameFolded} = ${folded} then 0
                   when ${nameFolded} like ${`${folded}%`} then 1
                   when ${nameFolded} like ${`% ${folded}%`} then 2
                   else 3 end`,
          sql`case when ${products.stock} > 0 then 0 else 1 end`,
          desc(products.salesCount),
          asc(products.name),
        ];
      }
      return [desc(products.isFeatured), desc(products.salesCount), asc(products.name)];
    }
  }
}

export async function listProducts(f: ListFilters) {
  const perPage = Math.min(f.perPage ?? 24, 48);
  const page = Math.max(f.page ?? 1, 1);
  const where = and(...baseWhere(f));
  const [items, countRow] = await Promise.all([
    db.select(productCardSelect).from(products).leftJoin(brands, eq(brands.id, products.brandId)).where(where)
      .orderBy(...orderBy(f.sort, f.q)).limit(perPage).offset((page - 1) * perPage),
    db.select({ n: sql<number>`count(*)::int` }).from(products).leftJoin(brands, eq(brands.id, products.brandId)).where(where),
  ]);
  const total = countRow[0]?.n ?? 0;
  return { items: items as ProductCard[], total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function facetsFor(f: ListFilters) {
  const where = and(...baseWhere({ ...f, brandSlugs: undefined, concernSlugs: undefined, minPrice: undefined, maxPrice: undefined, inStock: undefined, promo: undefined, minRating: undefined }));
  const [brandRows, concernRows, priceRow] = await Promise.all([
    db.select({ slug: brands.slug, name: brands.name, n: sql<number>`count(*)::int` }).from(products)
      .innerJoin(brands, eq(brands.id, products.brandId)).where(where).groupBy(brands.slug, brands.name).orderBy(asc(brands.name)),
    db.select({ slug: concerns.slug, name: concerns.name, n: sql<number>`count(distinct ${products.id})::int` }).from(products)
      .leftJoin(brands, eq(brands.id, products.brandId))
      .innerJoin(productConcerns, eq(productConcerns.productId, products.id))
      .innerJoin(concerns, eq(concerns.id, productConcerns.concernId)).where(where).groupBy(concerns.slug, concerns.name).orderBy(asc(concerns.name)),
    db.select({ min: sql<number>`coalesce(min(${products.priceMillimes}),0)::int`, max: sql<number>`coalesce(max(${products.priceMillimes}),0)::int` })
      .from(products).leftJoin(brands, eq(brands.id, products.brandId)).where(where),
  ]);
  return { brands: brandRows, concerns: concernRows, priceMin: priceRow[0]?.min ?? 0, priceMax: priceRow[0]?.max ?? 0 };
}

export const getProductBySlug = cache(async (slug: string) => {
  const p = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), publiclyVisible),
    with: { brand: true, category: true, universe: true, concerns: { with: { concern: true } } },
  });
  if (!p) return null;
  const approved = await db.select().from(reviews).where(and(eq(reviews.productId, p.id), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt)).limit(20);
  return { ...p, reviews: approved };
});

export async function getFeatured(limit = 8) {
  const rows = await db.select(productCardSelect).from(products).leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(publiclyVisible, eq(products.isFeatured, true))).orderBy(desc(products.salesCount)).limit(limit);
  return rows as ProductCard[];
}
export async function getNewArrivals(limit = 8) {
  const rows = await db.select(productCardSelect).from(products).leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(publiclyVisible, eq(products.isNew, true))).orderBy(desc(products.createdAt)).limit(limit);
  return rows as ProductCard[];
}
export async function getPromoProducts(limit = 8) {
  const rows = await db.select(productCardSelect).from(products).leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(publiclyVisible, isNotNull(products.compareAtMillimes), sql`${products.compareAtMillimes} > ${products.priceMillimes}`))
    .orderBy(desc(sql`${products.compareAtMillimes} - ${products.priceMillimes}`)).limit(limit);
  return rows as ProductCard[];
}
export async function getByIds(ids: number[]) {
  if (!ids.length) return [] as ProductCard[];
  const rows = await db.select(productCardSelect).from(products).leftJoin(brands, eq(brands.id, products.brandId)).where(and(inArray(products.id, ids), publiclyVisible));
  const map = new Map(rows.map((r) => [r.id, r as ProductCard]));
  return ids.map((id) => map.get(id)).filter((x): x is ProductCard => !!x);
}

export const getUniverses = cache(async () =>
  db.query.categories.findMany({ where: eq(categories.isUniverse, true), orderBy: asc(categories.sortOrder), with: { children: { orderBy: asc(categories.sortOrder) } } }),
);
export const getCategoryBySlug = cache(async (slug: string) =>
  db.query.categories.findFirst({ where: eq(categories.slug, slug), with: { children: { orderBy: asc(categories.sortOrder) }, parent: true } }),
);
export const getBrands = cache(async () => db.select().from(brands).orderBy(asc(brands.name)));
export const getBrandBySlug = cache(async (slug: string) => db.query.brands.findFirst({ where: eq(brands.slug, slug) }));
export const getConcerns = cache(async () => db.select().from(concerns).orderBy(asc(concerns.name)));
export const getConcernBySlug = cache(async (slug: string) => db.query.concerns.findFirst({ where: eq(concerns.slug, slug) }));

export async function quickSearch(q: string, limit = 6) {
  if (q.trim().length < 2) return [] as ProductCard[];
  const match = searchWhere(q);
  if (!match) return [] as ProductCard[];
  const folded = foldText(q.trim());
  const nameFolded = foldColumn(products.name);
  const rows = await db.select(productCardSelect).from(products).leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(publiclyVisible, match))
    .orderBy(
      // Relevance first: exact name, then name prefix, then a word boundary,
      // then availability, then popularity. Accent- and case-insensitive.
      sql`case when ${nameFolded} = ${folded} then 0
               when ${nameFolded} like ${`${folded}%`} then 1
               when ${nameFolded} like ${`% ${folded}%`} then 2
               else 3 end`,
      sql`case when ${products.stock} > 0 then 0 else 1 end`,
      desc(products.salesCount),
      asc(products.name),
    ).limit(limit);
  return rows as ProductCard[];
}
