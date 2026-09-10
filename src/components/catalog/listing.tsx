import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { facetsFor, listProducts, type ListFilters } from "@/lib/catalog";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SearchIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/primitives";
import { ProductGrid } from "./product-card";
import { FilterPanel, MobileFilters, SortSelect } from "./filters";

export type SP = Record<string, string | string[] | undefined>;
export function parseFilters(sp: SP): Partial<ListFilters> {
  const s = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const list = (k: string) => s(k)?.split(",").filter(Boolean);
  return {
    q: s("q"),
    brandSlugs: list("brands"),
    concernSlugs: list("concerns"),
    minPrice: s("min") ? Number(s("min")) : undefined,
    maxPrice: s("max") ? Number(s("max")) : undefined,
    inStock: s("stock") === "1",
    promo: s("promo") === "1",
    minRating: s("rating") ? Number(s("rating")) : undefined,
    sort: (s("sort") as ListFilters["sort"]) ?? "featured",
    page: s("page") ? Number(s("page")) : 1,
  };
}

export async function Listing({
  base,
  sp,
  hideBrands,
  hideConcerns,
  basePath,
}: {
  base: ListFilters;
  sp: SP;
  hideBrands?: boolean;
  hideConcerns?: boolean;
  basePath: string;
}) {
  const filters = { ...base, ...parseFilters(sp) };
  const [{ items, total, page, pages }, facets, user] = await Promise.all([
    listProducts(filters),
    facetsFor(base),
    getCurrentUser(),
  ]);
  const wished = user
    ? (await db.select({ id: wishlistItems.productId }).from(wishlistItems).where(eq(wishlistItems.userId, user.id))).map((w) => w.id)
    : [];
  const qs = (p: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (typeof v === "string") u.set(k, v);
    u.set("page", String(p));
    return `${basePath}?${u}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-24">
          <FilterPanel facets={facets} hideBrands={hideBrands} hideConcerns={hideConcerns} />
        </div>
      </aside>
      <div className="lg:col-span-9">
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3">
          <div className="flex items-center gap-3">
            <MobileFilters facets={facets} hideBrands={hideBrands} hideConcerns={hideConcerns} />
            <p className="rounded-full bg-bg-soft px-3 py-1 text-xs font-medium text-text-muted">
              {total} produit{total > 1 ? "s" : ""}
            </p>
          </div>
          <SortSelect />
        </div>
        {items.length === 0 ? (
          <EmptyState
            icon={<SearchIcon size={22} />}
            title="Aucun produit ne correspond"
            description="Essayez d'élargir vos filtres ou explorez un autre univers."
            action={{ href: basePath, label: "Réinitialiser les filtres" }}
          />
        ) : (
          <>
            <ProductGrid items={items} wishedIds={wished} isAuthed={!!user} />
            {pages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: pages }).map((_, i) => (
                  <Link
                    key={i}
                    href={qs(i + 1)}
                    aria-current={page === i + 1 ? "page" : undefined}
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors",
                      page === i + 1
                        ? "bg-copper text-bg shadow-[0_4px_12px_rgba(196,164,132,0.3)]"
                        : "border border-line bg-surface text-text-muted hover:border-copper/30 hover:text-copper",
                    ].join(" ")}
                  >
                    {i + 1}
                  </Link>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
