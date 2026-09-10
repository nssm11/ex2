"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { CheckIcon, HeartIcon, PlusIcon } from "@/components/icons";
import { Badge } from "@/components/ui/primitives";
import { Stars } from "@/components/ui/stars";
import { useToast } from "@/components/ui/toaster";
import type { ProductCard as PC } from "@/lib/catalog";
import { discountPercent, formatDT } from "@/lib/money";
import { EASE_LUXE } from "@/lib/motion";
import { toggleWishlistAction } from "@/actions/shop";
import { cn } from "@/lib/utils";

export function ProductCard({
  p,
  wished = false,
  priority = false,
  isAuthed = false,
}: {
  p: PC;
  wished?: boolean;
  priority?: boolean;
  isAuthed?: boolean;
}) {
  const cart = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [added, setAdded] = useState(false);
  const [w, setW] = useState(wished);
  const [pending, start] = useTransition();
  const pct = discountPercent(p.priceMillimes, p.compareAtMillimes);
  const out = p.stock <= 0;
  const low = !out && p.stock <= p.lowStockThreshold;

  const quickAdd = () => {
    if (out) return;
    cart.add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      brandName: p.brandName,
      image: p.image,
      priceMillimes: p.priceMillimes,
      stock: p.stock,
      volume: p.volume,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast({
      kind: "success",
      title: "Ajouté au panier",
      description: p.name,
      action: { label: "Voir le panier", onClick: cart.open },
    });
  };
  const wish = () => {
    if (!isAuthed) {
      router.push("/connexion?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    start(async () => {
      const r = await toggleWishlistAction(p.id);
      if (r.ok) {
        setW(r.data.wished);
        toast({ kind: "success", title: r.message ?? "" });
      } else toast({ kind: "error", title: r.error });
    });
  };

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ duration: 0.5, ease: EASE_LUXE }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-surface p-2 shadow-card transition-colors duration-300 hover:border-line-strong hover:shadow-card-hover"
    >
      {/* Image — tactile, dark lab, soft vignette */}
      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-bg-soft">
        {/* subtle copper glow behind product */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(196,164,132,0.16), transparent 62%)",
          }}
        />
        {/* soft grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,242,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,242,235,0.5) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <Link
          href={`/produit/${p.slug}`}
          aria-label={p.name}
          tabIndex={-1}
          className="absolute inset-0 z-[1]"
        >
          {p.image && (
            <Image
              src={p.image}
              alt={p.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className={cn(
                "object-contain p-6 drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]",
                out && "opacity-70 saturate-[0.7]",
              )}
            />
          )}
        </Link>

        {/* Vignette bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[12px]"
          style={{
            background:
              "linear-gradient(to top, rgba(18,18,18,0.22), transparent 42%), radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.18) 100%)",
          }}
        />

        {/* Badges — pill, glass */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
          {pct > 0 && (
            <span className="inline-flex items-center rounded-full bg-copper px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-bg shadow-[0_4px_12px_rgba(196,164,132,0.35)]">
              −{pct}%
            </span>
          )}
          {p.isNew && !pct && (
            <span className="inline-flex items-center rounded-full border border-line bg-surface/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-text backdrop-blur">
              Nouveau
            </span>
          )}
          {out && (
            <span className="inline-flex items-center rounded-full border border-line bg-bg/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted backdrop-blur">
              Épuisé
            </span>
          )}
        </div>

        {/* Wishlist — floating glass button */}
        <button
          onClick={wish}
          disabled={pending}
          aria-pressed={w}
          aria-label={w ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`}
          className={cn(
            "absolute right-2.5 top-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all duration-300",
            w
              ? "border-copper/30 bg-copper text-bg shadow-[0_4px_16px_rgba(196,164,132,0.35)]"
              : "border-line bg-surface/70 text-text-muted hover:border-line-strong hover:bg-surface hover:text-text",
          )}
        >
          <motion.span
            animate={w && !reduce ? { scale: [1, 1.18, 1] } : {}}
            transition={{ duration: 0.5, ease: EASE_LUXE }}
            className="flex"
          >
            <HeartIcon size={15} filled={w} />
          </motion.span>
        </button>

        {/* Quick add — pill, appears on hover, glass + copper */}
        {!out && (
          <div className="absolute inset-x-2.5 bottom-2.5 z-10">
            <button
              onClick={quickAdd}
              aria-label={`Ajouter ${p.name} au panier`}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-text text-bg shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur transition-all duration-500 hover:bg-white md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.06em] text-bg"
                  >
                    <CheckIcon size={14} /> Ajouté
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.06em]"
                  >
                    <PlusIcon size={13} /> Ajouter
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
      </div>

      {/* Content — clinical, spaced, apothecary */}
      <div className="flex flex-1 flex-col px-2.5 pb-1 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          {p.brandName ? (
            <Link
              href={`/marque/${p.brandSlug}`}
              className="rounded-full border border-line bg-bg-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-copper/30 hover:text-copper"
            >
              {p.brandName}
            </Link>
          ) : (
            <span />
          )}
          {p.volume && <span className="text-[11px] tabular-nums text-text-dim">{p.volume}</span>}
        </div>

        <h3 className="mt-2.5 line-clamp-2 text-[14px] font-[500] leading-snug tracking-[-0.01em] text-text">
          <Link href={`/produit/${p.slug}`} className="hover:text-copper transition-colors">
            {p.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tabular-nums tracking-tight text-text">
                {formatDT(p.priceMillimes)}
              </span>
              {pct > 0 && p.compareAtMillimes && (
                <span className="text-xs tabular-nums text-text-dim line-through">
                  {formatDT(p.compareAtMillimes)}
                </span>
              )}
            </div>
            {low && (
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-copper">
                <span className="h-1 w-1 rounded-full bg-copper" aria-hidden /> Plus que {p.stock}
              </p>
            )}
            {!low && !out && (
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-text-dim">
                <span className="h-1 w-1 rounded-full bg-sage" aria-hidden />
                En stock · 24–72h
              </p>
            )}
            {out && <p className="mt-1 text-[11px] text-text-dim">Rupture · réassort bientôt</p>}
          </div>
          {p.ratingCount > 0 && <Stars value={p.ratingAvg / 100} count={p.ratingCount} size={10} />}
        </div>
      </div>
    </motion.article>
  );
}

export function ProductGrid({
  items,
  wishedIds = [],
  isAuthed = false,
  priorityCount = 4,
}: {
  items: PC[];
  wishedIds?: number[];
  isAuthed?: boolean;
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 gap-y-6 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
      {items.map((p, i) => (
        <ProductCard
          key={p.id}
          p={p}
          wished={wishedIds.includes(p.id)}
          isAuthed={isAuthed}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
