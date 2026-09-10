"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { BagIcon, CloseIcon, GiftIcon, TrashIcon, TruckIcon } from "@/components/icons";
import { Checkbox, QtyStepper } from "@/components/ui/primitives";
import { formatDT, FREE_SHIPPING_THRESHOLD, GIFT_WRAP_FEE, remainingForFreeShipping, shippingFor } from "@/lib/money";
import type { ProductCard } from "@/lib/catalog";
import { EASE_LUXE, tweenExit } from "@/lib/motion";
import { isOutOfStock, maxPurchasable, safeStock } from "@/lib/stock";
import { useFocusTrap } from "@/lib/use-focus-trap";

export function CartDrawer() {
  const cart = useCart();
  const reduce = useReducedMotion();
  const drawerRef = useRef<HTMLElement>(null);
  useFocusTrap(drawerRef, cart.isOpen);
  const [confirmClear, setConfirmClear] = useState(false);
  const [reco, setReco] = useState<{ key: string; items: ProductCard[] }>({ key: "", items: [] });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.close();
    if (cart.isOpen) { window.addEventListener("keydown", onKey); document.body.style.overflow = "hidden"; }
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [cart.isOpen, cart]);

  // The shelf follows the cart: it is recomputed from the products the customer
  // actually picked, and those products are never suggested back to them.
  const seedKey = cart.hydrated ? cart.lines.map((l) => l.productId).join(",") : "";
  useEffect(() => {
    if (!cart.isOpen || !seedKey) return;
    let on = true;
    fetch(`/api/recommendations?ids=${seedKey}&limit=3`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: ProductCard[] }) => { if (on) setReco({ key: seedKey, items: d.items ?? [] }); })
      .catch(() => { /* keep the previous shelf rather than blanking it */ });
    return () => { on = false; };
  }, [seedKey, cart.isOpen]);
  // Only show a shelf that was computed for the cart currently on screen.
  const suggestions = reco.key === seedKey ? reco.items : [];

  const remaining = remainingForFreeShipping(cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shipping = shippingFor(cart.subtotal);
  const wrap = cart.giftWrap ? GIFT_WRAP_FEE : 0;
  const outOfStockLines = cart.lines.filter((l) => isOutOfStock(l.stock));

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <>
          <motion.button aria-label="Fermer le panier" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.5 } }} exit={{ opacity: 0, transition: tweenExit }} onClick={cart.close} className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm" />
          <motion.aside
            ref={drawerRef}
            role="dialog" aria-modal="true" aria-label="Votre panier"
            initial={reduce ? false : { x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 160, damping: 28, mass: 1 }}
            className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-paper shadow-drawer"
            style={{ willChange: "transform" }}
          >
            <div className="flex h-16 items-center justify-between border-b border-stone px-5">
              <h2 className="font-display text-2xl text-ink">Votre panier <span className="font-sans text-sm tabular-nums text-muted">({cart.count})</span></h2>
              <button onClick={cart.close} aria-label="Fermer" className="flex h-11 w-11 items-center justify-center text-ink"><CloseIcon /></button>
            </div>

            {!cart.hydrated ? (
              <div className="flex-1 px-5 py-5">
                <div className="skeleton h-3 w-40" />
                <div className="skeleton mt-2.5 h-px w-full" />
                <ul className="mt-6 space-y-5">{[0, 1, 2].map((i) => (
                  <li key={i} className="flex gap-4">
                    <div className="skeleton aspect-square w-20 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="skeleton h-2.5 w-20" />
                      <div className="skeleton h-3.5 w-4/5" />
                      <div className="skeleton mt-3 h-9 w-28" />
                    </div>
                  </li>
                ))}</ul>
              </div>
            ) : cart.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <BagIcon size={36} className="mb-5 text-sand-2" />
                <p className="font-display text-display-sm text-ink">Votre panier est vide</p>
                <p className="mt-2 text-sm text-muted">Découvrez notre sélection de soins conseillés par nos pharmaciens.</p>
                <Link href="/boutique" onClick={cart.close} className="btn-primary mt-8">Découvrez la boutique</Link>
              </div>
            ) : (
              <>
                <div className="border-b border-stone px-5 py-4">
                  <div className="flex items-center gap-2 text-xs text-charcoal"><TruckIcon size={16} className="text-vert" />{remaining > 0 ? <span>Plus que <strong className="text-ink">{formatDT(remaining)}</strong> pour la livraison offerte</span> : <span className="text-success">Livraison offerte</span>}</div>
                  <div className="mt-2.5 h-px w-full bg-stone"><motion.div className="h-px origin-left bg-vert" initial={false} animate={{ scaleX: progress / 100 }} transition={{ duration: 0.9, ease: EASE_LUXE }} style={{ willChange: "transform" }} /></div>
                </div>

                <div className="flex-1 overflow-y-auto px-5">
                  <ul className="divide-y divide-stone">
                    <AnimatePresence initial={false}>
                      {cart.lines.map((l) => {
                        const stock = safeStock(l.stock);
                        const out = isOutOfStock(stock);
                        return (
                          <motion.li key={l.productId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: tweenExit }} className="flex gap-4 py-5">
                            <Link href={`/produit/${l.slug}`} onClick={cart.close} className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-sm bg-paper-2">{l.image && <Image src={l.image} alt="" fill sizes="80px" className="object-cover" />}</Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <p className="text-micro font-semibold tracking-[0.08em] text-sage-2">{l.brandName}</p>
                              <Link href={`/produit/${l.slug}`} onClick={cart.close} className="mt-0.5 line-clamp-2 font-display text-[15px] leading-snug text-ink transition-colors duration-300 hover:text-vert-3">{l.name}</Link>
                              {l.volume && <p className="text-xs text-muted-2">{l.volume}</p>}
                              {out && <p className="mt-1 text-[11px] font-semibold text-error">Épuisé — à retirer avant de commander</p>}
                              <div className="mt-auto flex items-center justify-between pt-3">
                                <QtyStepper size="sm" value={l.quantity} max={maxPurchasable(stock)} onChange={(v) => cart.setQty(l.productId, v)} />
                                <span className="font-display text-[17px] tabular-nums text-ink">{formatDT(l.priceMillimes * l.quantity)}</span>
                              </div>
                            </div>
                            <button onClick={() => cart.remove(l.productId)} aria-label={`Retirer ${l.name}`} className="flex h-11 w-8 items-start justify-center pt-1 text-muted-2 transition-colors hover:text-error"><TrashIcon size={16} /></button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>

                  {suggestions.length > 0 && (
                    <div className="border-t border-stone py-5">
                      <p className="eyebrow mb-3">Complétez votre routine</p>
                      <ul className="space-y-3">
                        {suggestions.map((s) => {
                          const out = isOutOfStock(s.stock);
                          return (
                            <li key={s.id} className="flex items-center gap-3">
                              <Link href={`/produit/${s.slug}`} onClick={cart.close} className="relative aspect-square w-12 shrink-0 overflow-hidden rounded-sm bg-paper-2">{s.image && <Image src={s.image} alt="" fill sizes="48px" className="object-cover" />}</Link>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-display text-sm text-ink">{s.name}</p>
                                <p className="text-xs text-muted">{out ? "Épuisé" : formatDT(s.priceMillimes)}</p>
                              </div>
                              <button
                                onClick={() => cart.add({ productId: s.id, slug: s.slug, name: s.name, brandName: s.brandName, image: s.image, priceMillimes: s.priceMillimes, stock: safeStock(s.stock), volume: s.volume })}
                                disabled={out}
                                className="min-h-11 border border-stone-2 px-3 text-micro font-semibold tracking-[0.08em] text-ink transition-colors duration-300 hover:border-vert hover:text-vert disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Ajouter
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4 border-t border-stone py-5">
                    <div className="flex min-h-11 items-center justify-between gap-3 text-sm text-charcoal">
                      <span className="flex items-center gap-2"><GiftIcon size={16} className="text-vert" /> Emballage cadeau <span className="text-muted">(+{formatDT(GIFT_WRAP_FEE)})</span></span>
                      <Checkbox checked={cart.giftWrap} onChange={(v) => cart.setGiftWrap(v)} label={<span className="sr-only">Emballage cadeau</span>} />
                    </div>
                    <textarea value={cart.note} onChange={(e) => cart.setNote(e.target.value)} placeholder="Note pour la commande (facultatif)" rows={2} maxLength={500} className="field text-sm" aria-label="Note pour la commande" />
                  </div>
                </div>

                <div className="border-t border-stone bg-cream px-5 py-5">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-muted">Sous-total</dt><dd className="tabular-nums text-ink">{formatDT(cart.subtotal)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Livraison estimée</dt><dd className="tabular-nums text-ink">{shipping === 0 ? "Offerte" : formatDT(shipping)}</dd></div>
                    {wrap > 0 && <div className="flex justify-between"><dt className="text-muted">Emballage cadeau</dt><dd className="tabular-nums text-ink">{formatDT(wrap)}</dd></div>}
                    <div className="flex justify-between border-t border-stone pt-3 font-display text-xl text-ink"><dt>Total</dt><dd className="tabular-nums">{formatDT(cart.subtotal + shipping + wrap)}</dd></div>
                  </dl>

                  {outOfStockLines.length > 0 && (
                    <p className="mt-3 bg-error-soft px-3 py-2 text-xs text-error">
                      {outOfStockLines.length === 1 ? "Un article de votre panier est épuisé" : `${outOfStockLines.length} articles de votre panier sont épuisés`} — retirez-le{outOfStockLines.length > 1 ? "s" : ""} pour passer commande.
                    </p>
                  )}

                  <Link href="/commande" onClick={cart.close} className="btn-primary mt-4 w-full">Passer la commande</Link>

                  {/* Two actions only: order, or empty the cart. The old
                      "Voir le panier" link sat next to them and pointed at the
                      page you were already on. */}
                  <div className="mt-3 flex items-center justify-end text-xs">
                    {confirmClear ? (
                      <span className="flex items-center gap-2 text-muted">Vider le panier&nbsp;? <button onClick={() => { cart.clear(); setConfirmClear(false); }} className="text-error underline underline-offset-4">Oui</button><button onClick={() => setConfirmClear(false)} className="text-ink underline underline-offset-4">Non</button></span>
                    ) : (
                      <button onClick={() => setConfirmClear(true)} className="text-muted underline-offset-4 hover:text-error hover:underline">Vider</button>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
