"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState, useTransition } from "react";
import { CloseIcon, FilterIcon, SortIcon } from "@/components/icons";
import { formatDTShort } from "@/lib/money";
import type { SortKey } from "@/lib/catalog";
import { tweenExit } from "@/lib/motion";

export type Facets = {
  brands: { slug: string; name: string; n: number }[];
  concerns: { slug: string; name: string; n: number }[];
  priceMin: number;
  priceMax: number;
};
const SORTS: { v: SortKey; l: string }[] = [
  { v: "featured", l: "Notre sélection" },
  { v: "bestsellers", l: "Meilleures ventes" },
  { v: "newest", l: "Nouveautés" },
  { v: "price_asc", l: "Prix croissant" },
  { v: "price_desc", l: "Prix décroissant" },
  { v: "rating", l: "Mieux notés" },
];

export function useFilterParams() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const update = useCallback(
    (mut: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(sp.toString());
      mut(p);
      p.delete("page");
      start(() => router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false }));
    },
    [sp, router, pathname],
  );
  const toggleMulti = (key: string, v: string) =>
    update((p) => {
      const cur = new Set((p.get(key) ?? "").split(",").filter(Boolean));
      if (cur.has(v)) cur.delete(v);
      else cur.add(v);
      if (cur.size) p.set(key, [...cur].join(","));
      else p.delete(key);
    });
  const set = (key: string, v: string | null) =>
    update((p) => (v ? p.set(key, v) : p.delete(key)));
  const clearAll = () => start(() => router.replace(pathname, { scroll: false }));
  const has = (key: string, v: string) => (sp.get(key) ?? "").split(",").includes(v);
  const activeCount = ["brands", "concerns", "min", "max", "stock", "promo", "rating"].filter((k) =>
    sp.get(k),
  ).length;
  return { sp, toggleMulti, set, clearAll, has, activeCount, pending };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group rounded-xl border border-line bg-surface/40 p-3 backdrop-blur">
      <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-text">
        {title}
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-bg-soft text-text-muted transition-transform duration-300 group-open:rotate-45">
          <span className="block text-sm leading-none">+</span>
        </span>
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  );
}
function Check({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label
      className={[
        "flex min-h-9 cursor-pointer items-center gap-3 rounded-full border px-3 py-1 text-sm transition-colors",
        checked
          ? "border-copper/30 bg-copper-soft text-copper"
          : "border-transparent bg-bg-soft text-text-muted hover:border-line hover:text-text",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 shrink-0 accent-copper"
      />
      <span className="flex-1 text-[13px]">{label}</span>
      {count != null && (
        <span
          className={[
            "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
            checked ? "bg-copper text-bg" : "bg-surface text-text-dim",
          ].join(" ")}
        >
          {count}
        </span>
      )}
    </label>
  );
}

export function FilterPanel({
  facets,
  hideConcerns = false,
  hideBrands = false,
}: {
  facets: Facets;
  hideConcerns?: boolean;
  hideBrands?: boolean;
}) {
  const f = useFilterParams();
  const urlMin = f.sp.get("min") ?? "";
  const urlMax = f.sp.get("max") ?? "";
  const [min, setMin] = useState(urlMin);
  const [max, setMax] = useState(urlMax);
  const [synced, setSynced] = useState(`${urlMin}\u0000${urlMax}`);
  const current = `${urlMin}\u0000${urlMax}`;
  if (current !== synced) {
    setSynced(current);
    setMin(urlMin);
    setMax(urlMax);
  }
  return (
    <div className={["space-y-3", f.pending ? "opacity-60" : ""].join(" ")}>
      <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-soft text-text-muted">
            <FilterIcon size={13} />
          </span>
          Filtres
          {f.activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-copper px-1.5 text-[10px] font-bold text-bg">
              {f.activeCount}
            </span>
          )}
        </span>
        {f.activeCount > 0 && (
          <button
            onClick={f.clearAll}
            className="rounded-full border border-line bg-bg-soft px-3 py-1.5 text-xs font-medium text-text-muted hover:text-copper"
          >
            Tout effacer
          </button>
        )}
      </div>

      <Section title="Disponibilité">
        <div className="flex flex-col gap-1.5">
          <Check
            checked={f.sp.get("stock") === "1"}
            onChange={() => f.set("stock", f.sp.get("stock") === "1" ? null : "1")}
            label="En stock uniquement"
          />
          <Check
            checked={f.sp.get("promo") === "1"}
            onChange={() => f.set("promo", f.sp.get("promo") === "1" ? null : "1")}
            label="En promotion"
          />
        </div>
      </Section>

      {!hideBrands && facets.brands.length > 0 && (
        <Section title="Marques">
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
            {facets.brands.map((b) => (
              <Check
                key={b.slug}
                checked={f.has("brands", b.slug)}
                onChange={() => f.toggleMulti("brands", b.slug)}
                label={b.name}
                count={b.n}
              />
            ))}
          </div>
        </Section>
      )}
      {!hideConcerns && facets.concerns.length > 0 && (
        <Section title="Besoins">
          <div className="flex flex-col gap-1">
            {facets.concerns.map((c) => (
              <Check
                key={c.slug}
                checked={f.has("concerns", c.slug)}
                onChange={() => f.toggleMulti("concerns", c.slug)}
                label={c.name}
                count={c.n}
              />
            ))}
          </div>
        </Section>
      )}

      <Section title="Prix">
        <p className="mb-2 text-xs text-text-dim">
          De {formatDTShort(facets.priceMin)} à {formatDTShort(facets.priceMax)}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            f.set("min", min ? String(Math.round(Number(min) * 1000)) : null);
            f.set("max", max ? String(Math.round(Number(max) * 1000)) : null);
          }}
          className="flex items-center gap-2"
        >
          <input
            inputMode="decimal"
            value={min ? String(Number(min) / (min.length > 4 ? 1000 : 1)) : ""}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min"
            aria-label="Prix minimum (DT)"
            className="field h-10 min-h-0 flex-1 rounded-full px-3 text-sm"
          />
          <span className="text-text-dim">–</span>
          <input
            inputMode="decimal"
            value={max ? String(Number(max) / (max.length > 4 ? 1000 : 1)) : ""}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max"
            aria-label="Prix maximum (DT)"
            className="field h-10 min-h-0 flex-1 rounded-full px-3 text-sm"
          />
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-copper text-bg hover:bg-[#D1B196]">
            OK
          </button>
        </form>
      </Section>

      <Section title="Note minimale">
        <div className="flex gap-2">
          {[4, 3].map((r) => (
            <button
              key={r}
              onClick={() => f.set("rating", f.sp.get("rating") === String(r) ? null : String(r))}
              className={[
                "flex h-9 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                f.sp.get("rating") === String(r)
                  ? "border-copper bg-copper text-bg"
                  : "border-line bg-bg-soft text-text-muted hover:border-copper/30 hover:text-copper",
              ].join(" ")}
            >
              {r}★ <span className="opacity-70">et +</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function SortSelect() {
  const f = useFilterParams();
  return (
    <label className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-text-muted">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-soft">
        <SortIcon size={12} />
      </span>
      <span className="hidden sm:inline">Trier :</span>
      <select
        value={(f.sp.get("sort") as SortKey) ?? "featured"}
        onChange={(e) => f.set("sort", e.target.value === "featured" ? null : e.target.value)}
        className="min-h-8 bg-transparent pr-2 text-sm text-text focus:outline-none"
        aria-label="Trier par"
      >
        {SORTS.map((s) => (
          <option key={s.v} value={s.v} className="bg-bg">
            {s.l}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MobileFilters(props: { facets: Facets; hideConcerns?: boolean; hideBrands?: boolean }) {
  const [open, setOpen] = useState(false);
  const f = useFilterParams();
  const reduce = useReducedMotion();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-medium uppercase tracking-[0.08em] text-text hover:bg-surface-2 lg:hidden"
      >
        <FilterIcon size={13} /> Filtres {f.activeCount > 0 && `(${f.activeCount})`}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="Fermer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filtres"
              initial={reduce ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: tweenExit }}
              transition={{ type: "spring", stiffness: 180, damping: 30 }}
              className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[24px] border-t border-line bg-bg shadow-float lg:hidden"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
                <span className="font-display text-[16px] font-[550] text-text">Filtres</span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto bg-bg-soft px-4 py-4">
                <FilterPanel {...props} />
              </div>
              <div className="border-t border-line bg-bg p-4">
                <button onClick={() => setOpen(false)} className="btn-primary w-full">
                  Voir les résultats
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
