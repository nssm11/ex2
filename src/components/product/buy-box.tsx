"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CheckIcon, HeartIcon, ShieldIcon, StoreIcon, TruckIcon } from "@/components/icons";
import { QtyStepper } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toaster";
import { formatDT, FREE_SHIPPING_THRESHOLD } from "@/lib/money";
import { EASE_LUXE } from "@/lib/motion";
import { toggleWishlistAction } from "@/actions/shop";

type P = {
  id: number;
  slug: string;
  name: string;
  brandName: string | null;
  image: string | null;
  priceMillimes: number;
  compareAtMillimes: number | null;
  stock: number;
  lowStockThreshold: number;
  volume: string | null;
};

export function BuyBox({ p, wished, isAuthed }: { p: P; wished: boolean; isAuthed: boolean }) {
  const cart = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [w, setW] = useState(wished);
  const [pending, start] = useTransition();
  const out = p.stock <= 0;
  const low = !out && p.stock <= p.lowStockThreshold;

  const add = () => {
    cart.add(
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        brandName: p.brandName,
        image: p.image,
        priceMillimes: p.priceMillimes,
        stock: p.stock,
        volume: p.volume,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast({
      kind: "success",
      title: "Ajouté au panier",
      description: `${qty} × ${p.name}`,
      action: { label: "Voir le panier", onClick: cart.open },
    });
  };
  const wish = () => {
    if (!isAuthed) {
      router.push(`/connexion?next=/produit/${p.slug}`);
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
    <>
      <div className="space-y-5">
        {/* Stock — apothecary pill */}
        {out ? (
          <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-text-muted">
            Ce produit est momentanément épuisé. Contactez nos boutiques pour être prévenu(e) du réassort.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} max={Math.min(20, p.stock)} />
            {low ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/20 bg-copper-soft px-3 py-1.5 text-xs font-medium text-copper">
                <span className="h-1.5 w-1.5 rounded-full bg-copper" /> Plus que {p.stock} en stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/20 bg-sage-soft px-3 py-1.5 text-xs font-medium text-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" /> En stock · prêt à expédier
              </span>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={add}
            disabled={out}
            className="btn-primary relative flex-1 overflow-hidden rounded-full"
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4, ease: EASE_LUXE }}
                  className="flex items-center gap-2"
                >
                  <CheckIcon size={16} /> Ajouté au panier
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  {out ? "Épuisé" : `Ajouter · ${formatDT(p.priceMillimes * qty)}`}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={wish}
            disabled={pending}
            aria-pressed={w}
            aria-label={w ? "Retirer des favoris" : "Ajouter aux favoris"}
            className={[
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all",
              w
                ? "border-copper bg-copper text-bg shadow-[0_4px_16px_rgba(196,164,132,0.35)]"
                : "border-line bg-surface text-text-muted hover:border-copper/30 hover:bg-surface-2 hover:text-copper",
            ].join(" ")}
          >
            <motion.span
              animate={w && !reduce ? { scale: [1, 1.18, 1] } : {}}
              transition={{ duration: 0.5, ease: EASE_LUXE }}
              className="flex"
            >
              <HeartIcon size={18} filled={w} />
            </motion.span>
          </button>
        </div>

        <ul className="space-y-2 rounded-2xl border border-line bg-surface p-4">
          <li className="flex items-center gap-3 text-sm text-text-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-copper-soft text-copper">
              <TruckIcon size={14} />
            </span>
            Livraison 24–72 h · offerte dès {formatDT(FREE_SHIPPING_THRESHOLD)}
          </li>
          <li className="flex items-center gap-3 text-sm text-text-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-soft text-sage">
              <StoreIcon size={14} />
            </span>
            Retrait gratuit sous 2 h à Ezzahra ou Hammam-Lif
          </li>
          <li className="flex items-center gap-3 text-sm text-text-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-copper">
              <ShieldIcon size={14} />
            </span>
            Produit authentique · distribution officielle
          </li>
        </ul>

        {/* Real-time stock by store — Click & Collect */}
        <div className="rounded-2xl border border-line bg-bg-soft p-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            <StoreIcon size={12} className="text-copper" /> Disponibilité en boutique
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { name: "Ezzahra", status: p.stock > 5 ? "En stock" : p.stock > 0 ? `Plus que ${p.stock}` : "Sur commande", tone: p.stock > 0 ? "sage" : "copper" },
              { name: "Hammam-Lif", status: p.stock > 3 ? "En stock" : p.stock > 0 ? `Plus que ${p.stock}` : "Sur commande", tone: p.stock > 0 ? "sage" : "copper" },
            ].map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5"
              >
                <span className="text-sm font-medium text-text">{s.name}</span>
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    s.tone === "sage" ? "bg-sage-soft text-sage" : "bg-copper-soft text-copper",
                  ].join(" ")}
                >
                  <span className={["h-1.5 w-1.5 rounded-full", s.tone === "sage" ? "bg-sage" : "bg-copper"].join(" ")} />
                  {s.status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-dim">Stock temps réel · Click & Collect sous 2 h.</p>
        </div>
      </div>

      {/* Sticky mobile — glass pill */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-bg/80 px-4 py-3 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-text-muted">{p.name}</p>
          <p className="text-sm font-medium tabular-nums text-text">{formatDT(p.priceMillimes * qty)}</p>
        </div>
        <button onClick={add} disabled={out} className="btn-primary rounded-full px-6">
          {added ? <CheckIcon size={16} /> : out ? "Épuisé" : "Ajouter"}
        </button>
      </div>
    </>
  );
}
