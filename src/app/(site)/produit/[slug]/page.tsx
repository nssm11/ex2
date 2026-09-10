import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { SITE_URL } from "@/lib/env";
import { discountPercent, formatDT, formatDTShort } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge, Breadcrumbs } from "@/components/ui/primitives";
import { Stars } from "@/components/ui/stars";
import { Reveal } from "@/components/motion/reveal";
import { ProductGrid } from "@/components/catalog/product-card";
import { RecentlyViewed, TrackView } from "@/components/catalog/recently-viewed";
import { BuyBox } from "@/components/product/buy-box";
import { ReviewForm } from "@/components/product/review-form";
import { SectionHeading } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  const title = `${p.name}${p.brand ? ` — ${p.brand.name}` : ""}`;
  return {
    title,
    description: p.shortDescription ?? undefined,
    openGraph: {
      title,
      description: p.shortDescription ?? undefined,
      images: p.image ? [p.image] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, images: p.image ? [p.image] : [] },
  };
}

export default async function ProduitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, user] = await Promise.all([getProductBySlug(slug), getCurrentUser()]);
  if (!p) notFound();
  const [related, wishedRow] = await Promise.all([
    getRelated(p.id, p.categoryId, p.universeId, 4),
    user
      ? db.select().from(wishlistItems).where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, p.id))).limit(1)
      : Promise.resolve([]),
  ]);
  const pct = discountPercent(p.priceMillimes, p.compareAtMillimes);
  const out = p.stock <= 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.image ? [`${SITE_URL}${p.image}`] : [],
    description: p.shortDescription,
    sku: p.sku,
    brand: p.brand ? { "@type": "Brand", name: p.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/produit/${p.slug}`,
      priceCurrency: "TND",
      price: (p.priceMillimes / 1000).toFixed(3),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: p.ratingCount > 0
      ? { "@type": "AggregateRating", ratingValue: (p.ratingAvg / 100).toFixed(1), reviewCount: p.ratingCount }
      : undefined,
    review: p.reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.authorName }, reviewRating: { "@type": "Rating", ratingValue: r.rating }, reviewBody: r.body })),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      ...(p.universe ? [{ "@type": "ListItem", position: 2, name: p.universe.name, item: `${SITE_URL}/univers/${p.universe.slug}` }] : []),
      { "@type": "ListItem", position: 3, name: p.name, item: `${SITE_URL}/produit/${p.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <TrackView id={p.id} />

      {/* Gallery + Info — Modern Apothecary Lab */}
      <div className="border-b border-line bg-bg">
        <div className="container-lux pt-6 lg:pt-8">
          <Breadcrumbs
            items={[
              ...(p.universe ? [{ href: `/univers/${p.universe.slug}`, label: p.universe.name }] : []),
              ...(p.category ? [{ href: `/categorie/${p.category.slug}`, label: p.category.name }] : []),
              { label: p.name },
            ]}
          />
          <div className="mt-6 grid gap-8 pb-12 lg:grid-cols-12 lg:gap-10 lg:pb-16">
            {/* Gallery — dramatic, tactile */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-soft shadow-card lg:sticky lg:top-24">
                {/* glow behind */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    background: "radial-gradient(ellipse 60% 45% at 50% 38%, rgba(196,164,132,0.16), transparent 66%)",
                  }}
                />
                <div className="relative aspect-square">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={`${p.name} — ${p.brand?.name ?? "Cléopâtre"}`}
                      fill
                      priority
                      sizes="(max-width:1024px) 100vw, 58vw"
                      className={[
                        "object-contain p-10 drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)] transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]",
                        out ? "opacity-60 saturate-50" : "",
                      ].join(" ")}
                    />
                  )}
                  <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                    {pct > 0 && (
                      <span className="rounded-full bg-copper px-3 py-1 text-xs font-bold text-bg shadow-[0_4px_12px_rgba(196,164,132,0.35)]">
                        −{pct} %
                      </span>
                    )}
                    {p.isNew && !pct && (
                      <span className="rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-text backdrop-blur">
                        Nouveau
                      </span>
                    )}
                  </div>
                  {/* vignette */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      background: "radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.16) 100%)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-3">
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
                    {p.brand?.name ?? "Cléopâtre"} · Réf. {p.sku}
                  </span>
                  <span className="rounded-full border border-line bg-bg-soft px-2.5 py-1 text-xs tabular-nums text-text-muted">
                    {p.volume ?? "—"}
                  </span>
                </div>
              </div>

              {/* thumbnails / trust — lab cards */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { t: "Authentique", d: "Distribution officielle" },
                  { t: "Tolérance", d: "Testé dermatologiquement" },
                  { t: "Conseil", d: "Pharmacien disponible" },
                ].map((x) => (
                  <div key={x.t} className="rounded-xl border border-line bg-surface px-3 py-3 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-copper">{x.t}</p>
                    <p className="mt-1 text-xs leading-tight text-text-muted">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Information — clinical, spaced */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                {p.brand && (
                  <Link
                    href={`/marque/${p.brand.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted hover:border-copper/30 hover:text-copper"
                  >
                    <span className="font-display text-[13px] font-[550] normal-case tracking-[-0.01em] text-copper">
                      {p.brand.name}
                    </span>
                    →
                  </Link>
                )}
                <h1 className="mt-4 font-display text-display-md tracking-[-0.02em] text-text">{p.name}</h1>
                {p.volume && <p className="mt-1 text-sm text-text-dim">{p.volume} · {p.sku}</p>}
                {p.ratingCount > 0 && (
                  <a href="#avis" className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 hover:border-copper/20">
                    <Stars value={p.ratingAvg / 100} count={p.ratingCount} size={12} />
                    <span className="text-xs text-text-muted">· {p.ratingCount} avis</span>
                  </a>
                )}

                <div className="mt-6 flex flex-wrap items-baseline gap-3 rounded-2xl border border-line bg-surface p-4">
                  <span className="text-[28px] font-semibold tabular-nums tracking-tight text-text">{formatDT(p.priceMillimes)}</span>
                  {pct > 0 && p.compareAtMillimes && (
                    <>
                      <span className="text-sm tabular-nums text-text-dim line-through">{formatDT(p.compareAtMillimes)}</span>
                      <span className="rounded-full bg-sage-soft px-2.5 py-1 text-xs font-medium text-sage">
                        Économisez {formatDTShort(p.compareAtMillimes - p.priceMillimes)}
                      </span>
                    </>
                  )}
                  <span className="ml-auto text-xs text-text-dim">TVA incluse</span>
                </div>

                <p className="mt-5 text-[15px] leading-[1.75] text-text-muted">{p.shortDescription}</p>

                {p.concerns.length > 0 && (
                  <div className="mt-5">
                    <p className="eyebrow-copper mb-3 flex items-center gap-2">
                      <span className="h-px w-6 bg-copper/50" aria-hidden />
                      Répond à vos besoins
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {p.concerns.map((c) => (
                        <li key={c.concernId}>
                          <Link
                            href={`/besoin/${c.concern.slug}`}
                            className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted hover:border-copper/30 hover:bg-surface-2 hover:text-copper"
                          >
                            {c.concern.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <BuyBox
                    p={{
                      id: p.id,
                      slug: p.slug,
                      name: p.name,
                      brandName: p.brand?.name ?? null,
                      image: p.image,
                      priceMillimes: p.priceMillimes,
                      compareAtMillimes: p.compareAtMillimes,
                      stock: p.stock,
                      lowStockThreshold: p.lowStockThreshold,
                      volume: p.volume,
                    }}
                    wished={wishedRow.length > 0}
                    isAuthed={!!user}
                  />
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
                  {[
                    ["Description", p.description],
                    ["Composition & ingrédients", p.ingredients],
                    ["Conseils d'utilisation", p.howToUse],
                  ].map(([t, body], i) =>
                    body ? (
                      <details key={t} open={i === 0} className="group border-b border-line last:border-0">
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-text">
                          {t}
                          <span
                            aria-hidden="true"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-bg-soft text-text-muted transition-transform duration-300 group-open:rotate-45"
                          >
                            +
                          </span>
                        </summary>
                        <p className="px-4 pb-4 text-[14px] leading-[1.8] text-text-muted">{body}</p>
                      </details>
                    ) : null,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avis — sage, clinical */}
      <section id="avis" className="border-b border-line bg-bg-soft">
        <div className="container-lux grid gap-8 py-10 lg:grid-cols-12 lg:py-12">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow-copper mb-4 flex items-center gap-2">
                <span className="h-px w-6 bg-copper/50" aria-hidden />
                Avis · L&apos;expérience réelle
              </p>
              <div className="flex items-end gap-2">
                <span className="font-display text-[56px] font-[600] leading-none tracking-[-0.03em] text-text">
                  {p.ratingCount > 0 ? (p.ratingAvg / 100).toFixed(1) : "—"}
                </span>
                <span className="pb-2 text-lg text-text-muted">/ 5</span>
              </div>
              {p.ratingCount > 0 && <Stars value={p.ratingAvg / 100} count={p.ratingCount} size={14} className="mt-3" />}
              <p className="mt-4 max-w-xs rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-text-muted">
                Avis authentiques, modérés par notre équipe. Nous ne supprimons jamais un retour négatif fondé.
              </p>
            </Reveal>
          </div>
          <div className="space-y-6 lg:col-span-8">
            {p.reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-text-muted">
                Aucun avis pour l&apos;instant. Soyez la première à partager votre expérience — elle aide les autres à choisir avec justesse.
              </p>
            ) : (
              <ul className="space-y-4">
                {p.reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-line bg-surface p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper-soft font-display text-sm font-semibold text-copper">
                          {r.authorName.charAt(0)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-text">{r.authorName}</p>
                          <p className="text-xs text-text-dim">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <Stars value={r.rating} showCount={false} size={12} />
                    </div>
                    {r.title && <p className="mt-3 text-[15px] font-medium text-text">{r.title}</p>}
                    <p className="mt-1.5 text-sm leading-[1.7] text-text-muted">{r.body}</p>
                    {r.reply && (
                      <div className="mt-4 rounded-xl border border-copper/15 bg-copper-soft px-4 py-3 text-sm leading-relaxed text-text">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-copper">Réponse de Cléopâtre</p>
                        {r.reply}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="rounded-2xl border border-line bg-surface p-5">
              <ReviewForm productId={p.id} defaultName={user ? `${user.firstName} ${user.lastName[0]}.` : ""} />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-b border-line bg-bg">
          <div className="container-lux py-10">
            <SectionHeading eyebrow="Complétez votre routine" title="Vous aimerez aussi" />
            <div className="mt-8">
              <ProductGrid items={related} isAuthed={!!user} priorityCount={0} />
            </div>
          </div>
        </section>
      )}
      <RecentlyViewed excludeId={p.id} isAuthed={!!user} />
      <div className="h-20 lg:hidden" />
    </>
  );
}
