import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, brands, promotions, stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getFeatured, getPromoProducts, getUniverses, getConcerns } from "@/lib/catalog";
import { ArrowRightIcon, CashIcon, ChatIcon, MapPinIcon, ShieldIcon, StoreIcon, TruckIcon } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProductGrid } from "@/components/catalog/product-card";
import { SectionHeading } from "@/components/ui/primitives";
import { HeroText } from "@/components/shell/hero-text";
import { formatDTShort } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [universes, featured, promos, brandRows, posts, storesRows, concerns, promoRows, user] = await Promise.all([
    getUniverses(),
    getFeatured(8),
    getPromoProducts(4),
    db.select().from(brands).where(eq(brands.isFeatured, true)).orderBy(desc(brands.isFeatured)).limit(6),
    db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt)).limit(3),
    db.select().from(stores).where(eq(stores.isActive, true)),
    getConcerns(),
    db.select().from(promotions).where(eq(promotions.isActive, true)).limit(4),
    getCurrentUser(),
  ]);
  const [lead, ...rest] = posts;
  const activePromos = promoRows.filter((p) => !p.endsAt || p.endsAt > new Date()).slice(0, 3);

  const PROMISES = [
    { i: ShieldIcon, t: "Authenticité garantie", d: "Approvisionnement direct auprès des laboratoires et distributeurs officiels." },
    { i: TruckIcon, t: "Livraison 24–72 h", d: "Partout en Tunisie. Offerte dès 99 DT, paiement à la livraison." },
    { i: StoreIcon, t: "Retrait en boutique en 2 h", d: "Commandez en ligne, retirez en boutique à Ezzahra ou Hammam-Lif." },
    { i: CashIcon, t: "Prix justes", d: "Nos offres portent sur des références réelles, jamais de fausses remises." },
  ];

  const STATS = [
    { t: "100 %", d: "authentique" },
    { t: "2", d: "boutiques · conseil" },
    { t: "24–72 h", d: "partout en Tunisie" },
  ];

  return (
    <>
      {/* ══ 01 — ENTRÉE ══ */}
      <section className="relative overflow-hidden border-b border-stone">
        <div className="container-lux grid min-h-[86svh] items-center gap-12 pb-20 pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-16">
          <div className="relative z-10 lg:col-span-6">
            <HeroText />
            <div className="mt-10 flex flex-wrap items-center gap-3.5">
              <Link href="/boutique" className="btn-primary">
                Découvrir la boutique
              </Link>
              <Link href="/besoin/peau-sensible" className="btn-secondary">
                Trouver mon soin
              </Link>
            </div>
            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-y-6 border-t border-stone pt-7">
              {STATS.map((x) => (
                <div key={x.d} className="border-l border-stone px-3 first:border-l-0 first:pl-0 sm:px-5">
                  <dt className="sr-only">{x.d}</dt>
                  <dd className="font-display text-[1.75rem] leading-none tracking-tight text-ink">{x.t}</dd>
                  <dd className="mt-2 text-micro leading-snug text-muted">{x.d}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:col-span-6">
            <div className="frame-grain aspect-[4/3] w-full">
              <Image
                src="/images/hero.jpg"
                alt="Nature morte éditoriale — soins Cléopâtre"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <Reveal
              delay={0.85}
              y={12}
              className="absolute -bottom-6 left-4 right-4 border border-stone bg-cream/95 p-6 shadow-soft backdrop-blur sm:left-auto sm:right-6 sm:w-80"
            >
              <p className="flex items-center gap-2 text-micro font-semibold tracking-[0.1em] text-vert">
                <ChatIcon size={13} /> Conseil pharmaceutique
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-charcoal">
                Une question sur un actif ou une routine ? Nos pharmaciens vous répondent, en boutique comme au 71 450 210.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 02 — RAISONS DE CROIRE ══ */}
      <section className="border-b border-stone bg-cream" aria-label="Nos engagements">
        <div className="container-lux grid grid-cols-2 gap-px bg-stone lg:grid-cols-4">
          {PROMISES.map((x) => (
            <div key={x.t} className="bg-cream px-6 py-9 lg:px-8 lg:py-11">
              <x.i size={22} className="text-vert" />
              <p className="mt-6 text-[13px] font-semibold leading-snug text-ink">{x.t}</p>
              <p className="mt-2.5 text-small leading-relaxed text-muted">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 03 — UNIVERS ══ */}
      <section className="container-lux py-section-sm lg:py-section">
        <Reveal>
          <SectionHeading
            eyebrow="Explorer par univers"
            title="Sept rayons, une exigence"
            description="Chaque univers est construit avec nos pharmaciens : des références éprouvées, classées par besoin réel — pas par marketing."
            action={{ href: "/boutique", label: "Toute la boutique" }}
          />
        </Reveal>
        <div className="mt-14 border-t border-stone">
          {universes.map((u, i) => (
            <Reveal key={u.id} y={10} delay={0.02 * i}>
              <Link
                href={`/univers/${u.slug}`}
                className="group grid items-center gap-6 border-b border-stone py-6 lg:grid-cols-12 lg:gap-10 lg:py-8"
              >
                <span className="hidden font-display text-sm italic text-sage-2 lg:col-span-1 lg:block" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative order-2 h-44 w-full overflow-hidden bg-stone sm:h-52 lg:order-none lg:col-span-4 lg:h-44">
                  {u.image && (
                    <Image
                      src={u.image}
                      alt={u.name}
                      fill
                      sizes="(max-width:1024px) 100vw, 30vw"
                      className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                    />
                  )}
                </div>
                <div className="lg:col-span-6">
                  <h2 className="font-display text-display-md text-ink transition-colors duration-500 group-hover:text-vert lg:text-display-sm xl:text-display-md">
                    {u.name}
                  </h2>
                  <p className="mt-2.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted">{u.story}</p>
                  <p className="mt-3.5 text-micro font-semibold tracking-[0.1em] text-sage-2">{u.children.length} catégories</p>
                </div>
                <span className="hidden justify-end pr-1 text-ink transition-transform duration-500 group-hover:translate-x-1.5 group-hover:text-vert lg:col-span-1 lg:flex">
                  <ArrowRightIcon size={20} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ 04 — SÉLECTION ══ */}
      <section className="border-y border-stone bg-cream">
        <div className="container-lux py-section-sm lg:py-section">
          <Reveal>
            <SectionHeading
              eyebrow="La sélection"
              title="Les essentiels de nos pharmaciens"
              description="Huit références que nous conseillons chaque jour en boutique — tolérance, efficacité, transparence."
              action={{ href: "/boutique?sort=bestsellers", label: "Meilleures ventes" }}
            />
          </Reveal>
          <div className="mt-14">
            <ProductGrid items={featured} isAuthed={!!user} />
          </div>
        </div>
      </section>

      {/* ══ 05 — OFFRES · monde de campagne, vert profond ══ */}
      <section className="bg-vert text-cream">
        <div className="container-lux grid gap-14 py-section-sm lg:grid-cols-12 lg:gap-12 lg:py-section">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow mb-6 text-cream/45">Offres du moment</p>
              <h2 className="font-display text-display-md italic leading-tight text-cream sm:text-display-lg">Prix justes, sans artifice.</h2>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/65">
                Des remises réelles, portées par des codes transparents, valables sur des références que nous défendons toute l&apos;année.
              </p>
              <ul className="mt-10 border-t border-cream/15">
                {activePromos.map((p) => (
                  <li key={p.id} className="border-b border-cream/15">
                    <Link href="/promotions" className="group flex items-baseline justify-between gap-4 py-4">
                      <span className="flex items-baseline gap-4">
                        <code className="font-display text-xl tracking-[0.02em] text-champagne-3">{p.code}</code>
                        <span className="hidden text-xs text-cream/60 sm:inline">{p.label}</span>
                      </span>
                      {p.minSubtotalMillimes > 0 && (
                        <span className="shrink-0 text-micro font-semibold tracking-[0.08em] text-cream/45">
                          dès {formatDTShort(p.minSubtotalMillimes)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <Stagger className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:gap-6" delay={0.05}>
              {promos.map((p) => (
                <StaggerItem key={p.id}>
                  <Link href={`/produit/${p.slug}`} className="group block">
                    <div className="frame relative aspect-square">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="(max-width:768px) 100vw, 20vw"
                          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        />
                      )}
                      <span className="absolute left-3 top-3 bg-sage-3 px-2 py-1 text-micro font-semibold tracking-[0.06em] text-vert-2">Offre</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-micro tracking-[0.08em] text-cream/45">{p.brandName}</p>
                      <p className="mt-1.5 line-clamp-2 font-display text-[15px] leading-snug text-cream/90">{p.name}</p>
                      <p className="mt-2 text-sm text-cream/65">
                        <span className="text-cream">{formatDTShort(p.priceMillimes)}</span>
                        {p.compareAtMillimes && <span className="ml-2 text-xs line-through opacity-60">{formatDTShort(p.compareAtMillimes)}</span>}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
            <div className="mt-10 text-right">
              <Link href="/promotions" className="btn-light">
                Toutes les offres <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 06 — BESOINS ══ */}
      <section className="border-b border-stone bg-paper">
        <div className="container-lux grid gap-12 py-section-sm lg:grid-cols-12 lg:gap-14 lg:py-section">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="eyebrow mb-5">Par besoin</p>
                <h2 className="font-display text-display-md text-ink sm:text-display-lg">
                  Que cherchez-
                  <br className="hidden lg:block" />
                  vous vraiment&nbsp;?
                </h2>
                <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
                  Peau sensible, taches, chute de cheveux, immunité… Entrez par votre préoccupation : nous vous guidons vers les produits qui répondent, sans
                  jargon.
                </p>
                <Link href="/besoin/peau-sensible" className="btn-ghost mt-8">
                  Commencer le diagnostic doux <ArrowRightIcon size={14} />
                </Link>
              </Reveal>
            </div>
          </div>
          <Stagger className="grid content-start gap-px border-t border-stone sm:grid-cols-2 lg:col-span-8" delay={0.05}>
            {concerns.map((c) => (
              <StaggerItem key={c.id}>
                <Link
                  href={`/besoin/${c.slug}`}
                  className="group flex h-full items-center justify-between gap-5 border-b border-stone px-5 py-7 transition-colors duration-500 hover:bg-cream sm:px-7"
                >
                  <div>
                    <p className="font-display text-[1.35rem] leading-none text-ink transition-colors duration-500 group-hover:text-vert">{c.name}</p>
                    <p className="mt-2.5 line-clamp-2 text-small leading-relaxed text-muted">{c.intro}</p>
                  </div>
                  <ArrowRightIcon
                    size={16}
                    className="shrink-0 text-sand transition-all duration-500 group-hover:translate-x-1 group-hover:text-vert"
                  />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ══ 07 — MARQUES ══ */}
      <section className="border-b border-stone bg-cream">
        <div className="container-lux grid gap-12 py-section-sm lg:grid-cols-12 lg:gap-14 lg:py-section">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow mb-5">Nos marques</p>
              <h2 className="font-display text-display-md text-ink sm:text-display-lg">
                Des laboratoires
                <br />
                qui nous font confiance.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                Seize maisons dermatologiques et de soin, distribuées officiellement en Tunisie. Chacune a été choisie pour une raison que nous savons expliquer.
              </p>
              <div className="mt-9 flex flex-wrap gap-2.5">
                {brandRows.map((b) => (
                  <Link
                    key={b.id}
                    href={`/marque/${b.slug}`}
                    className="inline-flex min-h-11 items-center rounded-sm border border-stone-2 px-4 font-display text-[15px] text-charcoal transition-colors duration-300 hover:border-vert hover:bg-vert hover:text-cream"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
              <Link href="/marques" className="btn-ghost mt-9">
                Toutes nos marques <ArrowRightIcon size={14} />
              </Link>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Stagger className="grid gap-px border border-stone bg-stone sm:grid-cols-2" delay={0.05}>
              {brandRows.slice(0, 6).map((b) => (
                <StaggerItem key={b.id}>
                  <Link
                    href={`/marque/${b.slug}`}
                    className="group flex h-full flex-col justify-between gap-10 bg-cream p-7 transition-colors duration-500 hover:bg-paper lg:min-h-48"
                  >
                    <p className="font-display text-xl leading-tight text-ink transition-colors duration-500 group-hover:text-vert">{b.name}</p>
                    <p className="line-clamp-3 text-small leading-relaxed text-muted">{b.story}</p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ══ 08 — JOURNAL ══ */}
      <section className="border-b border-stone bg-paper">
        <div className="container-lux py-section-sm lg:py-section">
          <Reveal>
            <SectionHeading
              eyebrow="Le Journal"
              title="Comprendre avant d'acheter"
              description="Des articles courts et honnêtes, écrits par nos pharmaciens."
              action={{ href: "/journal", label: "Tous les articles" }}
            />
          </Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
            {lead && (
              <Reveal className="lg:col-span-7">
                <Link href={`/journal/${lead.slug}`} className="group block">
                  <div className="frame relative aspect-[16/10]">
                    {lead.image && (
                      <Image
                        src={lead.image}
                        alt=""
                        fill
                        sizes="(max-width:1024px) 100vw, 58vw"
                        className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="mt-6 flex items-center gap-4 text-micro font-semibold tracking-[0.08em] text-muted">
                    <span className="border-b border-sage pb-0.5 text-vert">{lead.tag}</span>
                    <span>{lead.readMinutes} min</span>
                    <span>{formatDate(lead.publishedAt)}</span>
                  </div>
                  <h2 className="mt-3.5 font-display text-display-md text-balance text-ink transition-colors duration-500 group-hover:text-vert">{lead.title}</h2>
                  <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted">{lead.excerpt}</p>
                </Link>
              </Reveal>
            )}
            <div className="space-y-8 lg:col-span-5">
              {rest.map((a) => (
                <Reveal key={a.id}>
                  <Link href={`/journal/${a.slug}`} className="group flex gap-6 border-t border-stone pt-7">
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-stone sm:h-32 sm:w-28">
                      {a.image && (
                        <Image
                          src={a.image}
                          alt=""
                          fill
                          sizes="120px"
                          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-micro font-semibold tracking-[0.08em] text-muted">
                        {a.tag} · {a.readMinutes} min
                      </p>
                      <h3 className="mt-2.5 font-display text-display-sm text-balance text-ink transition-colors duration-500 group-hover:text-vert">
                        {a.title}
                      </h3>
                      <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted">{a.excerpt}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 09 — BOUTIQUES ══ */}
      <section className="bg-cream">
        <div className="container-lux grid items-center gap-12 py-section-sm lg:grid-cols-12 lg:gap-14 lg:py-section">
          <Reveal className="relative order-2 aspect-[4/3] lg:order-1 lg:col-span-6 lg:aspect-[5/4]">
            <div className="frame-grain absolute inset-0">
              <Image
                src="/images/maison.jpg"
                alt="La maison Cléopâtre — parapharmacie Ezzahra"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-5 hidden border border-stone bg-paper px-5 py-4 shadow-soft sm:block">
              <p className="flex items-center gap-2 text-micro font-semibold tracking-[0.1em] text-vert">
                <MapPinIcon size={13} /> Le Grand Tunis
              </p>
              <p className="mt-1.5 text-sm text-charcoal">Ezzahra · Hammam-Lif</p>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2 lg:col-span-6">
            <Reveal>
              <p className="eyebrow mb-5">La maison</p>
              <h2 className="font-display text-display-md text-ink sm:text-display-lg">Deux adresses, une exigence</h2>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
                Depuis Ezzahra et Hammam-Lif, nos équipes reçoivent, conseillent et préparent vos commandes. Retrait sous deux heures, conseil en personne, ou
                livraison 24–72 h partout en Tunisie.
              </p>
              <div className="mt-9 space-y-5 border-t border-stone pt-8">
                {storesRows.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-xl text-ink">{s.name}</p>
                      <p className="mt-1 text-small text-muted">
                        {s.address} · {s.hours}
                      </p>
                    </div>
                    <a href={`tel:+216${s.phone}`} className="btn-secondary min-h-11 px-5">
                      {s.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3")}
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap gap-3.5">
                <Link href="/boutiques" className="btn-secondary">
                  Horaires & itinéraires
                </Link>
                <Link href="/aide" className="btn-ghost">
                  Aide & FAQ <ArrowRightIcon size={14} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
