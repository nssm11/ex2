import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, ChevronRightIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/* ── Section heading ──────────────────────────────────────────── */

export function SectionHeading({
  eyebrow, title, description, action, align = "left", className, index, italic,
}: {
  eyebrow?: string; title: string; description?: string;
  action?: { href: string; label: string }; align?: "left" | "center";
  className?: string; index?: string; italic?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between", align === "center" && "sm:flex-col sm:items-center sm:text-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "flex flex-col items-center")}>
        {eyebrow && (
          <p className="eyebrow mb-4 flex items-center gap-3">
            {index && <span className="font-display text-base italic text-sage-2">{index}</span>}
            {eyebrow}
          </p>
        )}
        <h2 className={cn("font-display text-display-md text-balance text-ink", italic && "italic")}>{title}</h2>
        {description && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-pretty text-muted">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-ghost shrink-0">
          {action.label} <ArrowRightIcon size={14} />
        </Link>
      )}
    </div>
  );
}

/* ── Page header ──────────────────────────────────────────────── */

export function PageHeader({
  eyebrow, title, description, align = "left",
}: {
  eyebrow?: string; title: string; description?: string; align?: "left" | "center";
}) {
  return (
    <header className={cn("border-b border-stone pb-10", align === "center" && "text-center")}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h1 className={cn("font-display text-display-lg text-balance text-ink", align === "center" && "mx-auto max-w-3xl")}>{title}</h1>
      {description && (
        <p className={cn("mt-4 max-w-xl text-[15px] leading-relaxed text-pretty text-muted", align === "center" && "mx-auto")}>{description}</p>
      )}
    </header>
  );
}

/* ── Breadcrumbs ──────────────────────────────────────────────── */

export function Breadcrumbs({ items, light }: { items: { href?: string; label: string }[]; light?: boolean }) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("text-small tracking-[0.01em]", light ? "text-cream/70" : "text-muted")}>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className={cn("transition-colors duration-300", light ? "hover:text-cream" : "hover:text-vert")}>
            Accueil
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <ChevronRightIcon size={10} className={light ? "text-cream/40" : "text-sand"} />
            {it.href ? (
              <Link href={it.href} className={cn("transition-colors duration-300", light ? "hover:text-cream" : "hover:text-vert")}>
                {it.label}
              </Link>
            ) : (
              <span className={light ? "text-cream/90" : "text-ink"} aria-current="page">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Empty state ──────────────────────────────────────────────── */

export function EmptyState({
  icon, title, description, action, tone = "light",
}: {
  icon: ReactNode; title: string; description?: string; action?: { href: string; label: string }; tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex flex-col items-center px-6 py-24 text-center", dark ? "bg-vert text-cream" : "border border-stone-2/60 bg-cream")}>
      <span className={cn("flex h-16 w-16 items-center justify-center", dark ? "border border-paper/25 text-sage-3" : "border border-stone-2 text-vert-3")}>{icon}</span>
      <h3 className={cn("mt-7 font-display text-display-sm text-balance", dark ? "text-cream" : "text-ink")}>{title}</h3>
      {description && <p className={cn("mt-3 max-w-sm text-sm leading-relaxed text-pretty", dark ? "text-cream/70" : "text-muted")}>{description}</p>}
      {action && (
        <Link href={action.href} className={cn("mt-9", dark ? "btn-light" : "btn-secondary")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────────── */

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error" | "ink" | "vert" | "outline";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-stone/70 text-charcoal",
    accent: "bg-botanical text-vert-3",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    error: "bg-error-soft text-error",
    ink: "bg-ink text-cream",
    vert: "bg-vert text-cream",
    outline: "border border-current",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-1 text-micro font-semibold tracking-[0.06em]", tones[tone], className)}>{children}</span>
  );
}

/* ── Quantity stepper ─────────────────────────────────────────── */

export function QtyStepper({ value, onChange, max = 20, min = 1, size = "md" }: { value: number; onChange: (v: number) => void; max?: number; min?: number; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-10" : "h-12";
  const w = size === "sm" ? "w-10" : "w-12";
  return (
    <div className={cn("inline-flex items-center border border-stone-2 bg-cream", h)} role="group" aria-label="Quantité">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className={cn("flex items-center justify-center text-ink transition-colors duration-200 hover:text-vert disabled:opacity-25", w, h)}
      >
        <MinusIcon size={13} />
      </button>
      <span className="min-w-10 text-center text-sm tabular-nums text-ink" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className={cn("flex items-center justify-center text-ink transition-colors duration-200 hover:text-vert disabled:opacity-25", w, h)}
      >
        <PlusIcon size={13} />
      </button>
    </div>
  );
}

/* ── Checkbox ─────────────────────────────────────────────────── */

/**
 * Case native masquée mais focusable (`peer sr-only`) + carré dessiné : une
 * seule vérité pour l'état, un rendu identique dans tous les navigateurs.
 */
export function Checkbox({ checked, onChange, label, count, id }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; count?: number; id?: string }) {
  return (
    <label className="group flex min-h-10 cursor-pointer items-center gap-3 text-sm text-charcoal transition-colors duration-200 hover:text-ink">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "flex size-[17px] shrink-0 items-center justify-center border transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[rgba(47,90,68,0.25)]",
          checked ? "border-vert bg-vert text-cream" : "border-stone-2 text-transparent group-hover:border-vert-3",
        )}
      >
        <CheckIcon size={11} />
      </span>
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-xs tabular-nums text-muted-2">{count}</span>}
    </label>
  );
}

/* ── Checkout steps ───────────────────────────────────────────── */

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Étapes de commande">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center border text-small tabular-nums transition-all duration-500",
                done ? "border-vert bg-vert text-cream" : active ? "border-vert-3 bg-botanical text-vert" : "border-stone-2 text-muted-2",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={cn("hidden text-micro font-semibold tracking-[0.06em] sm:block", active ? "text-ink" : "text-muted-2")}>{s}</span>
            {i < steps.length - 1 && <span className={cn("h-px flex-1 transition-colors duration-700", done ? "bg-sage" : "bg-stone-2/60")} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Form field ───────────────────────────────────────────────── */

export function Field({ label, error, children, hint, htmlFor }: { label: string; error?: string; children: ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <label className="block text-left" htmlFor={htmlFor}>
      <span className="mb-2 block text-micro font-semibold tracking-[0.08em] text-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-muted-2">{hint}</span>}
      {error && (
        <span className="mt-1.5 block text-xs font-medium text-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

/* ── Product grid skeleton ────────────────────────────────────── */

export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-14">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-square" />
          <div className="skeleton mt-4 h-2.5 w-1/3" />
          <div className="skeleton mt-3 h-4 w-4/5" />
          <div className="skeleton mt-3 h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
