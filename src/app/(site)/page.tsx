import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, brands, promotions, stores } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getFeatured, getPromoProducts, getUniverses, getConcerns } from "@/lib/catalog";
import {
  ArrowRightIcon,
  CashIcon,
  ChatIcon,
  MapPinIcon,
  ShieldIcon,
  SparkIcon,
  TruckIcon,
  LeafIcon,
  SearchIcon,
  PackageIcon,
} from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProductGrid } from "@/components/catalog/product-card";
import { SectionHeading } from "@/components/ui/primitives";
import { HeroText } from "@/components/shell/hero-text";
import { formatDTShort } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const [universes, featured, promos, brandRows, posts, storesRows, concerns, promoRows, user] =
    await Promise.all([
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

  return (
    <>
      {/* ══ 01 — HERO · Modern Apothecary Laboratory ══ */}
      <section className="relative overflow-hidden border-b border-line bg-bg">
        {/* subtle grid + gradient */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid opacity-[0.035]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,rgba(196,164,132,0.09),transparent_62%),radial-gradient(ellipse_70%_45%_at_85%_85%,rgba(138,154,139,0.07),transparent_62%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
        </div>

        <div className="container-lux relative grid items-center gap-10 pb-10 pt-8 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-12">
          <div className="relative z-10 lg:col-span-6 xl:col-span-6">
            <HeroText />
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/boutique" className="btn-primary">
                Découvrir la boutique <ArrowRightIcon size={14} />
              </Link>
              <Link href="/boutique?sort=bestsellers" className="btn-secondary rounded-full">
                Routine sur-mesure
              </Link>
            </div>

            {/* Lab stats — glass pills */}
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-2">
              {[
                { t: "100%", d: "authentique", sub: "distributeurs officiels" },
                { t: "2", d: "laboratoires", sub: "Ezzahra · Hammam-Lif" },
                { t: "24–72h", d: "livraison", sub: "partout en Tunisie" },
              ].map((x) => (
                <div
                  key={x.d}
                  className="rounded-2xl border border-line bg-surface/70 p-4 backdrop-blur"
                >
                  <dt className="sr-only">{x.d}</dt>
                  <dd className="font-display text-[22px] font-[600] tracking-[-0.02em] text-text">{x.t}</dd>
                  <dd className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-copper">{x.d}</dd>
                  <dd className="mt-1 text-[11px] leading-tight text-text-dim">{x.sub}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 3D Showcase — dark, soft dramatic lighting */}
          <div className="relative lg:col-span-6">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] lg:aspect-[4/5.2]">
              {/* glow */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-[24px] opacity-60 blur-[36px]"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 50% at 50% 42%, rgba(196,164,132,0.22), transparent 66%)",
                }}
              />
              {/* frame */}
              <div className="absolute inset-0 overflow-hidden rounded-[24px] border border-line bg-surface shadow-float">
                <Image
                  src="/images/hero.jpg"
                  alt="Nature morte éditoriale — soins Cléopâtre, éclairage apothicaire"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* vignette + copper wash */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(18,18,18,0.55) 0%, transparent 45%), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.28) 100%)",
                  }}
                />
                {/* top lab line */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-bg/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-hidden />
                  Laboratoire Cléopâtre
                  <span className="hidden sm:inline">· Édition 2025</span>
                </div>
                {/* bottom dosage card */}
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-bg/70 p-3 backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">Formule du jour</p>
                    <p className="mt-1 font-display text-[15px] font-[500] leading-none text-white">
                      Avène · Hydrance Aqua-Gel
                    </p>
                    <p className="mt-1 text-xs text-white/60">50 ml · peau déshydratée</p>
                  </div>
                  <Link
                    href="/boutique"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper text-bg transition-colors hover:bg-white"
                    aria-label="Voir le produit"
                  >
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              </div>

              {/* floating pharmacist card — glassmorphism */}
              <Reveal delay={0.9} y={10} className="absolute -bottom-4 left-2 right-2 sm:left-auto sm:right-4 sm:w-[300px]">
                <div className="glass-strong rounded-2xl p-4">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-copper">
                    <ChatIcon size={13} /> Conseil pharmaceutique
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text">
                    Une question sur un actif ou une routine ? Nos pharmaciens vous répondent, en
                    boutique comme au <span className="font-medium text-copper">71 450 210</span>.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link href="/aide" className="flex-1 rounded-full bg-text px-3 py-2 text-center text-xs font-semibold text-bg hover:bg-white">
                      Poser une question
                    </Link>
                    <a href="tel:+21671450210" className="rounded-full border border-line px-3 py-2 text-xs font-medium text-text hover:bg-surface">
                      Appeler
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 02 — TRUST · Apothecary proof bar ══ */}
      <section className="border-b border-line bg-bg-soft" aria-label="Nos engagements">
        <div className="container-lux py-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                i: ShieldIcon,
                t: "Authenticité garantie",
                d: "Sourcing direct laboratoires & distributeurs officiels.",
                accent: "sage",
              },
              {
                i: TruckIcon,
                t: "Livraison 24–72h",
                d: "Partout en Tunisie. Offerte dès 99 DT.",
                accent: "copper",
              },
              {
                i: PackageIcon,
                t: "Click & collect 2h",
                d: "Retrait en boutique Ezzahra / Hammam-Lif.",
                accent: "copper",
              },
              {
                i: LeafIcon,
                t: "Prix justes",
                d: "Remises réelles, jamais de fausses promotions.",
                accent: "sage",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-surface-2"
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border",
                    x.accent === "copper" ? "border-copper/20 bg-copper-soft text-copper" : "border-sage/20 bg-sage-soft text-sage",
                  ].join(" ")}
                >
                  <x.i size={16} />
                </span>
                <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-text">{x.t}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 03 — ROUTINE BUILDER · flagship ══ */}
      <section className="relative overflow-hidden border-b border-line bg-bg">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_70%_0%,rgba(196,164,132,0.07),transparent_62%)]" />
        </div>
        <div className="container-lux relative grid gap-10 py-12 lg:grid-cols-12 lg:items-center lg:py-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow-copper mb-4 flex items-center gap-2">
                <span className="h-px w-6 bg-copper/60" aria-hidden /> Flagship
              </p>
              <h2 className="font-display text-display-md tracking-[-0.02em] text-text">
                Votre routine, <span className="italic font-[360] text-copper">prescrite avec justesse.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-muted">
                Répondez en 60 secondes. Notre apothicaire vous compose une routine en 3 étapes —
                nettoyant, soin, protection — adaptée à votre peau, pas au marketing.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/boutique" className="btn-primary">
                  <SparkIcon size={14} /> Créer ma routine
                </Link>
                <Link href="/aide" className="btn-ghost">
                  Comment ça marche <ArrowRightIcon size={14} />
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 border-t border-line pt-6 text-xs text-text-dim">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Sans jargon
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-copper" /> Validé pharmacien
                </span>
                <span className="inline-flex items-center gap-1.5">4 questions</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Stagger className="grid gap-3 sm:grid-cols-3" delay={0.07}>
              {[
                { n: "01", t: "Diagnostiquer", d: "Peau sensible, mixte, sèche ? On part de votre réel besoin.", icon: SearchIcon },
                { n: "02", t: "Composer", d: "Une routine courte, cohérente — pas 7 produits inutiles.", icon: LeafIcon },
                { n: "03", t: "Ajuster", d: "Retours faciles, conseil continu par téléphone.", icon: ChatIcon },
              ].map((s) => (
                <StaggerItem key={s.n}>
                  <div className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-surface-2">
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-copper/20 bg-copper-soft font-mono text-xs font-semibold text-copper">
                        {s.n}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-soft text-text-muted">
                        <s.icon size={14} />
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-[18px] font-[550] tracking-[-0.01em] text-text">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.d}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-copper">
                      Découvrir <ArrowRightIcon size={11} />
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            {/* mini stock preview */}
            <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-soft text-sage">
                  <PackageIcon size={14} />
                </span>
                <div>
                  <p className="text-sm font-medium text-text">Stock temps réel par boutique</p>
                  <p className="text-xs text-text-muted">Vérifiez Ezzahra ou Hammam-Lif avant de vous déplacer.</p>
                </div>
              </div>
              <Link href="/boutiques" className="mt-3 inline-flex rounded-full border border-line bg-bg px-4 py-2 text-xs font-medium text-text hover:bg-surface sm:mt-0">
                Voir les stocks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 04 — UNIVERS · dark lab cards ══ */}
      <section className="border-b border-line bg-bg-soft">
        <div className="container-lux py-12 lg:py-16">
          <Reveal>
            <SectionHeading
              eyebrow="Explorer par univers"
              title="Sept rayons, une exigence"
              description="Chaque univers est construit avec nos pharmaciens : des références éprouvées, classées par besoin réel — pas par marketing."
              action={{ href: "/boutique", label: "Toute la boutique" }}
            />
          </Reveal>

          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" delay={0.06}>
            {universes.map((u) => (
              <StaggerItem key={u.id}>
                <Link
                  href={`/univers/${u.slug}`}
                  className="group relative flex h-[280px] flex-col justify-end overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-1 hover:border-line-strong hover:shadow-card-hover"
                >
                  {u.image && (
                    <Image
                      src={u.image}
                      alt={u.name}
                      fill
                      sizes="(max-width:1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(18,18,18,0.88) 16%, rgba(18,18,18,0.42) 52%, rgba(18,18,18,0.08) 100%)",
                    }}
                  />
                  <div className="relative">
                    <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                      <span className="h-1 w-1 rounded-full bg-copper" aria-hidden />
                      {u.children.length} catégories
                    </p>
                    <h3 className="mt-3 font-display text-[22px] font-[550] leading-none tracking-[-0.015em] text-white">
                      {u.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 max-w-[28ch] text-xs leading-relaxed text-white/70">{u.story}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-copper">
                      Explorer <ArrowRightIcon size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ══ 05 — SÉLECTION · desire, 3D tactile ══ */}
      <section className="border-b border-line bg-bg">
        <div className="container-lux py-12 lg:py-16">
          <Reveal>
            <SectionHeading
              eyebrow="La sélection"
              title="Les essentiels de nos pharmaciens"
              description="Huit références que nous conseillons chaque jour en boutique — tolérance, efficacité, transparence."
              action={{ href: "/boutique?sort=bestsellers", label: "Meilleures ventes" }}
            />
          </Reveal>
          <div className="mt-10">
            <ProductGrid items={featured} isAuthed={!!user} />
          </div>
        </div>
      </section>

      {/* ══ 06 — OFFRE · copper lab, glass codes ══ */}
      <section className="relative overflow-hidden border-b border-line bg-bg-soft">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_0%,rgba(196,164,132,0.08),transparent_60%)]" />
        <div className="container-lux relative grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="eyebrow-copper mb-4 flex items-center gap-2">
                <span className="h-px w-6 bg-copper/60" aria-hidden /> Offres du moment
              </p>
              <h2 className="font-display text-display-md leading-[0.95] tracking-[-0.02em] text-text">
                Prix justes, <span className="italic font-[360] text-copper">sans artifice.</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
                Des remises réelles, portées par des codes transparents, valables sur des références que nous défendons toute l&apos;année.
              </p>
              <div className="mt-7 space-y-2">
                {activePromos.map((p) => (
                  <Link
                    key={p.id}
                    href="/promotions"
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-3 transition-colors hover:border-copper/30 hover:bg-surface-2"
                  >
                    <span className="flex items-baseline gap-3">
                      <code className="rounded-full bg-copper px-3 py-1 font-mono text-sm font-semibold tracking-[0.04em] text-bg">{p.code}</code>
                      <span className="hidden text-xs text-text-muted sm:inline">{p.label}</span>
                    </span>
                    {p.minSubtotalMillimes > 0 && (
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-dim">dès {formatDTShort(p.minSubtotalMillimes)}</span>
                    )}
                  </Link>
                ))}
              </div>
              <Link href="/promotions" className="btn-secondary mt-6 rounded-full">
                Toutes les offres <ArrowRightIcon size={14} />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4" delay={0.05}>
              {promos.map((p, i) => (
                <StaggerItem key={p.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                  <Link href={`/produit/${p.slug}`} className="group block h-full">
                    <div
                      className={[
                        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-line-strong",
                        i === 0 ? "min-h-[360px]" : "min-h-[220px]",
                      ].join(" ")}
                    >
                      <div className="relative flex-1 overflow-hidden bg-bg-soft">
                        {p.image && (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="(max-width:768px) 100vw, 20vw"
                            className="object-contain p-6 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                        )}
                        <span className="absolute left-3 top-3 rounded-full bg-copper px-2.5 py-1 text-[10px] font-bold text-bg">
                          Offre
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-text">{p.name}</p>
                        <p className="mt-1.5 text-sm font-semibold text-copper">
                          {formatDTShort(p.priceMillimes)}
                          {p.compareAtMillimes && (
                            <span className="ml-2 text-xs font-normal text-text-dim line-through">{formatDTShort(p.compareAtMillimes)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ══ 07 — BESOINS · clinical discovery ══ */}
      <section className="border-b border-line bg-bg">
        <div className="container-lux grid gap-8 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="eyebrow-copper mb-4 flex items-center gap-2">
                  <span className="h-px w-6 bg-copper/60" aria-hidden /> Par besoin
                </p>
                <h2 className="font-display text-display-md tracking-[-0.02em] text-text">
                  Que cherchez- <br className="hidden lg:block" />
                  vous vraiment&nbsp;?
                </h2>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-text-muted">
                  Peau sensible, taches, chute de cheveux, immunité… Entrez par votre préoccupation : nous vous guidons vers les produits qui répondent, sans jargon.
                </p>
                <Link href="/besoin/peau-sensible" className="btn-primary mt-6 rounded-full">
                  Commencer le diagnostic <ArrowRightIcon size={14} />
                </Link>
              </Reveal>
            </div>
          </div>

          <Stagger className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-8" delay={0.05}>
            {concerns.map((c) => (
              <StaggerItem key={c.id}>
                <Link
                  href={`/besoin/${c.slug}`}
                  className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-copper/20 hover:bg-surface-2"
                >
                  <div>
                    <p className="font-display text-[17px] font-[550] tracking-[-0.01em] text-text group-hover:text-copper transition-colors">
                      {c.name}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-muted">{c.intro}</p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg-soft text-text-muted transition-colors group-hover:border-copper/30 group-hover:bg-copper group-hover:text-bg">
                    <ArrowRightIcon size={14} />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ══ 08 — MARQUES · houses ══ */}
      <section className="border-b border-line bg-bg-soft">
        <div className="container-lux grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow-copper mb-4 flex items-center gap-2">
                <span className="h-px w-6 bg-copper/60" aria-hidden /> Nos marques
              </p>
              <h2 className="font-display text-display-md tracking-[-0.02em] text-text">
                Des laboratoires <br />
                <span className="italic font-[360] text-copper">qui nous font confiance.</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-muted">
                Seize maisons dermatologiques et de soin, distribuées officiellement en Tunisie. Chacune a été choisie pour une raison que nous savons expliquer.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {brandRows.map((b) => (
                  <Link
                    key={b.id}
                    href={`/marque/${b.slug}`}
                    className="inline-flex items-center rounded-full border border-line bg-surface px-4 py-2 font-display text-[14px] font-[500] text-text transition-colors hover:border-copper/30 hover:bg-surface-2 hover:text-copper"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
              <Link href="/marques" className="btn-ghost mt-7">
                Toutes nos marques <ArrowRightIcon size={14} />
              </Link>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Stagger className="grid gap-3 sm:grid-cols-2" delay={0.05}>
              {brandRows.slice(0, 6).map((b) => (
                <StaggerItem key={b.id}>
                  <Link
                    href={`/marque/${b.slug}`}
                    className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong hover:bg-surface-2"
                  >
                    <p className="font-display text-[18px] font-[550] tracking-[-0.01em] text-text group-hover:text-copper transition-colors">{b.name}</p>
                    <p className="line-clamp-3 text-sm leading-relaxed text-text-muted">{b.story}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-dim group-hover:text-copper">
                      Découvrir <ArrowRightIcon size={12} />
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ══ 09 — JOURNAL · editorial, dark lab ══ */}
      <section className="border-b border-line bg-bg">
        <div className="container-lux py-12 lg:py-16">
          <Reveal>
            <SectionHeading
              eyebrow="Le Journal"
              title="Comprendre avant d'acheter"
              description="Des articles courts et honnêtes, écrits par nos pharmaciens."
              action={{ href: "/journal", label: "Tous les articles" }}
            />
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            {lead && (
              <Reveal className="lg:col-span-7">
                <Link href={`/journal/${lead.slug}`} className="group block overflow-hidden rounded-2xl border border-line bg-surface">
                  <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
                    {lead.image && (
                      <Image
                        src={lead.image}
                        alt=""
                        fill
                        sizes="(max-width:1024px) 100vw, 58vw"
                        className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                      />
                    )}
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/15 bg-bg/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-hidden />
                      {lead.tag} · {lead.readMinutes} min
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-text-muted">{formatDate(lead.publishedAt)}</p>
                    <h2 className="mt-2 font-display text-display-md tracking-[-0.015em] text-text group-hover:text-copper transition-colors">{lead.title}</h2>
                    <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-text-muted">{lead.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            )}
            <div className="space-y-4 lg:col-span-5">
              {rest.map((a) => (
                <Reveal key={a.id}>
                  <Link
                    href={`/journal/${a.slug}`}
                    className="group flex gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
                  >
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-bg-soft sm:h-32 sm:w-28">
                      {a.image && (
                        <Image
                          src={a.image}
                          alt=""
                          fill
                          sizes="120px"
                          className="object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-copper">
                        {a.tag} · {a.readMinutes} min
                      </p>
                      <h3 className="mt-1.5 font-display text-[16px] font-[550] leading-tight tracking-[-0.01em] text-text group-hover:text-copper transition-colors line-clamp-2">
                        {a.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-muted">{a.excerpt}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 10 — BOUTIQUES · presence, dark apothecary ══ */}
      <section className="bg-bg-soft">
        <div className="container-lux grid items-center gap-10 py-12 lg:grid-cols-12 lg:py-16">
          <Reveal className="relative order-2 lg:order-1 lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:aspect-[5/4]">
              <Image src="/images/maison.jpg" alt="La maison Cléopâtre — parapharmacie Ezzahra" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/55 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 left-4 hidden items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-copper-soft text-copper">
                <MapPinIcon size={14} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-copper">Le Grand Tunis</p>
                <p className="text-sm font-medium text-text">Ezzahra · Hammam-Lif</p>
              </div>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2 lg:col-span-6">
            <Reveal>
              <p className="eyebrow-copper mb-4 flex items-center gap-2">
                <span className="h-px w-6 bg-copper/60" aria-hidden /> La maison
              </p>
              <h2 className="font-display text-display-md tracking-[-0.02em] text-text">
                Deux adresses, <span className="italic font-[360] text-copper">une exigence</span>
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-text-muted">
                Depuis Ezzahra et Hammam-Lif, nos équipes reçoivent, conseillent et préparent vos commandes. Retrait sous deux heures, conseil en personne, ou livraison 24–72h partout en Tunisie.
              </p>
              <div className="mt-7 space-y-3">
                {storesRows.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
                    <div>
                      <p className="font-display text-[17px] font-[550] tracking-[-0.01em] text-text">{s.name}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {s.address} · {s.hours}
                      </p>
                    </div>
                    <a href={`tel:+216${s.phone}`} className="inline-flex rounded-full border border-line bg-bg px-4 py-2 text-sm font-medium text-text hover:bg-surface">
                      {s.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3")}
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/boutiques" className="btn-secondary rounded-full">
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
