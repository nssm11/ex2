"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CloseIcon, SearchIcon } from "@/components/icons";
import { formatDT } from "@/lib/money";
import type { ProductCard } from "@/lib/catalog";
import { EASE_LUXE, tweenExit } from "@/lib/motion";
import { useFocusTrap } from "@/lib/use-focus-trap";

const POPULAR = ["Anthelios", "Sérum vitamine C", "Eau micellaire", "Anti-chute", "Cicaplast", "Crème hydratante"];
const RECENT_KEY = "cleo.recent.v1";

function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as string[]; } catch { return []; }
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{ term: string; items: ProductCard[]; failed: boolean }>({ term: "", items: [], failed: false });
  const [busy, setBusy] = useState(false);
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const reduce = useReducedMotion();
  useFocusTrap(overlayRef, open);

  // Read at render time while open: no state sync needed, no effect cascade.
  const recent = open ? readRecent() : [];

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [open]);

  const term = q.trim();
  const active = term.length >= 2;
  // Results are stored together with the term they belong to: clearing the
  // field (or dropping below two characters) simply stops matching, which
  // restores the suggestions immediately without a reset effect.
  const fresh = result.term === term;
  const items = active && fresh ? result.items : [];
  const failed = active && fresh ? result.failed : false;
  const loading = active && busy;

  useEffect(() => {
    if (!active) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = (await r.json()) as { items?: ProductCard[] };
        setResult({ term, items: d.items ?? [], failed: false });
        setIdx(-1);
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        setResult({ term, items: [], failed: true });
      } finally {
        setBusy(false);
      }
    }, 180);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [term, active]);

  const clear = () => {
    setQ("");
    setResult({ term: "", items: [], failed: false });
    setBusy(false);
    setIdx(-1);
    inputRef.current?.focus();
  };

  const go = (query: string) => {
    const v = query.trim();
    if (!v) return;
    const next = [v, ...recent.filter((r) => r !== v)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    onClose(); setQ("");
    router.push(`/recherche?q=${encodeURIComponent(v)}`);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(-1, i - 1)); }
    if (e.key === "Enter") {
      if (idx >= 0 && items[idx]) { onClose(); router.push(`/produit/${items[idx].slug}`); } else go(q);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.4 } }} exit={{ opacity: 0, transition: tweenExit }} className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 p-0 backdrop-blur-md sm:p-6 sm:pt-[10vh]" onClick={onClose}>
          <motion.div
            ref={overlayRef}
            role="dialog" aria-modal="true" aria-label="Recherche"
            initial={reduce ? false : { opacity: 0, y: 12, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_LUXE } }} exit={{ opacity: 0, y: 6, transition: tweenExit }}
            onClick={(e) => e.stopPropagation()} onKeyDown={onKey}
            className="flex h-dvh w-full max-w-2xl flex-col bg-paper shadow-float sm:h-auto sm:max-h-[78vh]"
          >
            <div className="flex items-center gap-3 border-b border-stone px-4 sm:px-6">
              <SearchIcon size={20} className="text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => { const v = e.target.value; setQ(v); setBusy(v.trim().length >= 2); }} placeholder="Rechercher un produit, une marque, un besoin…" aria-label="Rechercher" className="h-16 flex-1 bg-transparent text-[17px] text-ink placeholder:text-muted-2 focus:outline-none" autoComplete="off" />
              {q.length > 0 && (
                <button onClick={clear} aria-label="Effacer la recherche" className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-ink"><CloseIcon size={16} /></button>
              )}
              <button onClick={onClose} aria-label="Fermer la recherche" className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-ink"><CloseIcon /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {q.trim().length < 2 ? (
                <div className="grid gap-8 sm:grid-cols-2">
                  {recent.length > 0 && (
                    <div>
                      <p className="eyebrow mb-3">Recherches récentes</p>
                      <ul className="space-y-1">{recent.map((r) => <li key={r}><button onClick={() => go(r)} className="flex min-h-11 w-full items-center justify-between text-left text-[15px] text-charcoal hover:text-ink">{r}<ArrowRightIcon size={14} className="text-sage" /></button></li>)}</ul>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-3">Recherches populaires</p>
                    <ul className="flex flex-wrap gap-2">{POPULAR.map((p) => <li key={p}><button onClick={() => go(p)} className="min-h-11 border border-stone-2 px-4 text-sm text-charcoal transition-colors duration-300 hover:border-vert hover:text-vert">{p}</button></li>)}</ul>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="eyebrow mb-3">{loading ? "Recherche en cours…" : failed ? "Recherche indisponible" : items.length ? `${items.length} résultat${items.length > 1 ? "s" : ""}` : "Aucun produit trouvé"}</p>
                  <ul role="listbox">
                    {items.map((p, i) => (
                      <li key={p.id} role="option" aria-selected={idx === i}>
                        <button onClick={() => { onClose(); router.push(`/produit/${p.slug}`); }} className={`flex w-full items-center gap-4 px-2 py-2.5 text-left transition-colors duration-200 ${idx === i ? "bg-botanical" : "hover:bg-cream"}`}>
                          <div className="relative aspect-square w-12 shrink-0 overflow-hidden rounded-sm bg-paper-2">{p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-micro font-semibold tracking-[0.08em] text-sage-2">{p.brandName}</p>
                            <p className="truncate font-display text-[15px] text-ink">{p.name}</p>
                          </div>
                          <span className="text-sm tabular-nums text-ink">{formatDT(p.priceMillimes)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {!loading && items.length > 0 && (
                    <button onClick={() => go(q)} className="btn-ghost mt-5">Voir tous les résultats pour « {q} » <ArrowRightIcon size={14} /></button>
                  )}
                  {!loading && failed && (
                    <p className="mt-4 text-sm text-muted">La recherche est momentanément indisponible. Réessayez dans un instant.</p>
                  )}
                  {!loading && !failed && items.length === 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted">Aucun produit ne correspond à «&nbsp;{q.trim()}&nbsp;». Vérifiez l&apos;orthographe, essayez un mot plus court ou parcourez la boutique.</p>
                      <Link href="/boutique" onClick={onClose} className="btn-ghost mt-5">Parcourir tous les produits <ArrowRightIcon size={14} /></Link>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="hidden items-center gap-4 border-t border-stone px-6 py-3 text-micro tracking-[0.06em] text-muted-2 sm:flex">
              <span><kbd className="border border-stone px-1">↑↓</kbd> naviguer</span><span><kbd className="border border-stone px-1">↵</kbd> ouvrir</span><span><kbd className="border border-stone px-1">échap</kbd> fermer</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
