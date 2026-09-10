"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { CheckIcon, HeartIcon, ShieldIcon, StoreIcon, TruckIcon } from "@/components/icons";
import { QtyStepper } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toaster";
import { formatDT, FREE_SHIPPING_THRESHOLD } from "@/lib/money";
import { isLowStock, isOutOfStock, maxPurchasable, safeStock } from "@/lib/stock";
import { EASE_LUXE } from "@/lib/motion";
import { toggleWishlistAction } from "@/actions/shop";

type P = { id: number; slug: string; name: string; brandName: string | null; image: string | null; priceMillimes: number; compareAtMillimes: number | null; stock: number | null; lowStockThreshold: number | null; volume: string | null };

export function BuyBox({ p, wished, isAuthed }: { p: P; wished: boolean; isAuthed: boolean }) {
  const cart = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [w, setW] = useState(wished);
  const [pending, start] = useTransition();
  // Stock can legitimately arrive as 0, null or undefined (stale cart payload,
  // partially loaded row…). It must never crash the page, and must never leave
  // an "add to cart" control enabled for a product we cannot actually ship.
  const stock = safeStock(p.stock);
  const out = isOutOfStock(stock);
  const low = isLowStock(stock, p.lowStockThreshold);

  const add = () => {
    if (out) return;
    cart.add({ productId: p.id, slug: p.slug, name: p.name, brandName: p.brandName, image: p.image, priceMillimes: p.priceMillimes, stock, volume: p.volume }, qty);
    setAdded(true); setTimeout(() => setAdded(false), 1600);
    toast({ kind: "success", title: "Ajouté au panier", description: `${qty} × ${p.name}`, action: { label: "Voir le panier", onClick: cart.open } });
  };
  const wish = () => {
    if (!isAuthed) { router.push(`/connexion?next=/produit/${p.slug}`); return; }
    start(async () => { const r = await toggleWishlistAction(p.id); if (r.ok) { setW(r.data.wished); toast({ kind: "success", title: r.message ?? "" }); } else toast({ kind: "error", title: r.error }); });
  };

  return (
    <>
      <div className="space-y-5">
        {out ? (
          <div className="rounded-sm border border-stone-2/70 bg-cream px-5 py-4">
            <p className="text-[13px] font-semibold text-error">Épuisé — rupture de stock</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Ce produit est momentanément indisponible. Nous le remettons en vente dès réassort&nbsp;: contactez nos boutiques pour être prévenu(e).
            </p>
            <Link href="/boutiques" className="mt-2.5 inline-block text-[13px] font-medium text-ink underline underline-offset-4">Voir les boutiques</Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <QtyStepper value={qty} onChange={setQty} max={maxPurchasable(stock)} />
            {low ? <p className="text-xs text-warning">Plus que {stock} en stock</p> : <p className="text-xs text-success">En stock</p>}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={add} disabled={out} className="btn-primary relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {added ? <motion.span key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4, ease: EASE_LUXE }} className="flex items-center gap-2"><CheckIcon size={16} /> Ajouté au panier</motion.span>
                : <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">{out ? "Épuisé" : `Ajouter au panier · ${formatDT(p.priceMillimes * qty)}`}</motion.span>}
            </AnimatePresence>
          </button>
          <button onClick={wish} disabled={pending} aria-pressed={w} aria-label={w ? "Retirer des favoris" : "Ajouter aux favoris"} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border transition-all duration-300 ${w ? "border-vert bg-vert text-cream" : "border-stone-2 text-ink hover:border-vert hover:bg-vert hover:text-cream"}`}>
            <motion.span animate={w && !reduce ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5, ease: EASE_LUXE }} className="flex"><HeartIcon size={18} filled={w} /></motion.span>
          </button>
        </div>
        <ul className="space-y-2.5 border-t border-stone pt-5 text-sm text-charcoal">
          <li className="flex items-center gap-3"><TruckIcon size={16} className="shrink-0 text-vert" /> Livraison 24–72 h · offerte dès {formatDT(FREE_SHIPPING_THRESHOLD)}</li>
          <li className="flex items-center gap-3"><StoreIcon size={16} className="shrink-0 text-vert" /> Retrait gratuit sous 2 h à Ezzahra ou Hammam-Lif</li>
          <li className="flex items-center gap-3"><ShieldIcon size={16} className="shrink-0 text-vert" /> Produit authentique, distribution officielle</li>
        </ul>
      </div>
      {/* Sticky mobile bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-stone bg-paper/95 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="min-w-0 flex-1"><p className="truncate text-micro text-muted">{p.name}</p><p className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">{formatDT(p.priceMillimes * qty)}</p></div>
        <button onClick={add} disabled={out} aria-disabled={out} className="btn-primary px-6">{added ? <CheckIcon size={16} /> : out ? "Épuisé" : "Ajouter"}</button>
      </div>
    </>
  );
}
