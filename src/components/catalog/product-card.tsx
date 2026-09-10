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
import { isLowStock, isOutOfStock, safeStock } from "@/lib/stock";
import { EASE_LUXE } from "@/lib/motion";
import { toggleWishlistAction } from "@/actions/shop";
import { cn } from "@/lib/utils";

/**
 * Carte produit — merchandisage de parapharmacie premium.
 *
 * Hiérarchie voulue, de haut en bas :
 *   image (le produit d'abord) → marque → nom → avis → prix → disponibilité.
 *
 * Choix de composition :
 *  • pas de carte imbriquée : l'image repose directement sur le fond de page,
 *    la respiration vient des marges et non d'un conteneur supplémentaire ;
 *  • le nom est composé en serif (Newsreader) — c'est le principal signal
 *    éditorial qui distingue la marque d'un e-commerce générique ;
 *  • les prix sont tabulaires pour s'aligner verticalement d'une carte à
 *    l'autre dans une grille ;
 *  • le texte de disponibilité n'apparaît que lorsqu'il est utile
 *    (stock bas, rupture). Le reste du temps : silence.
 */
export function ProductCard({ p, wished = false, priority = false, isAuthed = false }: { p: PC; wished?: boolean; priority?: boolean; isAuthed?: boolean }) {
  const cart = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [added, setAdded] = useState(false);
  const [w, setW] = useState(wished);
  const [pending, start] = useTransition();
  const pct = discountPercent(p.priceMillimes, p.compareAtMillimes);
  const stock = safeStock(p.stock);
  const out = isOutOfStock(stock);
  const low = isLowStock(stock, p.lowStockThreshold);

  const quickAdd = () => {
    if (out) return;
    cart.add({ productId: p.id, slug: p.slug, name: p.name, brandName: p.brandName, image: p.image, priceMillimes: p.priceMillimes, stock, volume: p.volume });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast({ kind: "success", title: "Ajouté au panier", description: p.name, action: { label: "Voir le panier", onClick: cart.open } });
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
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: 0.45, ease: EASE_LUXE }}
      className="group relative flex h-full flex-col"
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-paper-2">
        <Link href={`/produit/${p.slug}`} aria-label={p.name} tabIndex={-1} className="absolute inset-0">
          {p.image && (
            <Image
              src={p.image}
              alt={p.name}
              fill
              priority={priority}
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className={cn(
                "object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]",
                out && "opacity-60 saturate-[0.55] group-hover:scale-100",
              )}
            />
          )}
        </Link>

        {/* Badges — un seul emplacement, en haut à gauche */}
        {(pct > 0 || p.isNew || out) && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {out ? (
              <Badge tone="outline" className="bg-paper/85 text-error backdrop-blur-sm">
                Épuisé
              </Badge>
            ) : (
              <>
                {pct > 0 && <Badge tone="vert">-{pct} %</Badge>}
                {p.isNew && !pct && <Badge tone="accent">Nouveau</Badge>}
              </>
            )}
          </div>
        )}

        {/* Favoris — discret au repos, franc au survol */}
        <button
          onClick={wish}
          disabled={pending}
          aria-pressed={w}
          aria-label={w ? `Retirer ${p.name} des favoris` : `Ajouter ${p.name} aux favoris`}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-sm bg-paper/80 backdrop-blur-sm",
            "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "hover:bg-paper focus-visible:opacity-100 hover-hover:opacity-0 hover-hover:group-hover:opacity-100 hover-hover:group-focus-within:opacity-100",
            w ? "text-vert opacity-100" : "text-ink/55 hover:text-vert",
          )}
        >
          <motion.span animate={w && !reduce ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.5, ease: EASE_LUXE }} className="flex">
            <HeartIcon size={17} filled={w} />
          </motion.span>
        </button>

        {/* Ajout rapide */}
        {!out && (
          <div className="absolute inset-x-3 bottom-3 z-10">
            <button
              onClick={quickAdd}
              aria-label={`Ajouter ${p.name} au panier`}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-paper/92 backdrop-blur",
                "text-[11px] font-semibold tracking-[0.08em] text-ink",
                "transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "hover:bg-vert hover:text-cream focus-visible:bg-vert focus-visible:text-cream",
                "hover-hover:translate-y-1 hover-hover:opacity-0 hover-hover:group-hover:translate-y-0 hover-hover:group-hover:opacity-100 hover-hover:group-focus-within:opacity-100",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center gap-2 text-success"
                  >
                    <CheckIcon size={13} /> Ajouté
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-center gap-2"
                  >
                    <PlusIcon size={12} /> Ajouter
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
      </div>

      {/* ── Métadonnées ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-baseline justify-between gap-3">
          {p.brandName ? (
            <Link
              href={`/marque/${p.brandSlug}`}
              className="text-micro font-semibold tracking-[0.1em] text-sage-2 transition-colors duration-300 hover:text-vert"
            >
              {p.brandName}
            </Link>
          ) : (
            <span />
          )}
          {p.volume && <span className="shrink-0 text-micro tabular-nums text-muted-2">{p.volume}</span>}
        </div>

        <h3 className="mt-2 font-display text-[17px] leading-[1.35] text-ink">
          <Link href={`/produit/${p.slug}`} className="line-clamp-2 text-balance underline-offset-[5px] hover:underline">
            {p.name}
          </Link>
        </h3>

        {p.ratingCount > 0 && (
          <div className="mt-2">
            <Stars value={p.ratingAvg / 100} count={p.ratingCount} size={11} />
          </div>
        )}

        {/* Prix toujours aligné en bas de carte : les grilles restent lisibles
            même quand les noms occupent une ou deux lignes. */}
        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-[15px] font-semibold tabular-nums tracking-tight", out ? "text-muted-2" : "text-ink")}>
              {formatDT(p.priceMillimes)}
            </span>
            {pct > 0 && p.compareAtMillimes && (
              <span className="text-small tabular-nums text-muted-2 line-through">{formatDT(p.compareAtMillimes)}</span>
            )}
          </div>
          {low && <p className="mt-1 text-micro font-medium text-warning">Plus que {stock} en stock</p>}
          {out && <p className="mt-1 text-micro font-medium text-error">Rupture de stock</p>}
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
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-14">
      {items.map((p, i) => <ProductCard key={p.id} p={p} wished={wishedIds.includes(p.id)} isAuthed={isAuthed} priority={i < priorityCount} />)}
    </div>
  );
}
