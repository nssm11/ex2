import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, ChevronRightIcon, MinusIcon, PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

// Section heading — Modern Apothecary, precise, copper-accented
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
  index,
  italic,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
  index?: string;
  italic?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "flex flex-col items-center")}>
        <p
          className={cn(
            "eyebrow-copper mb-4 flex items-center gap-2.5",
            align === "center" && "justify-center",
          )}
        >
          {index && <span className="font-display text-[13px] italic text-copper">{index}</span>}
          <span className="h-px w-6 bg-copper/60" aria-hidden />
          {eyebrow}
        </p>
        <h2 className={cn("font-display text-display-md tracking-[-0.02em] text-text", italic && "italic")}>
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {action && (
        <Link href={action.href} className="btn-ghost shrink-0">
          {action.label} <ArrowRightIcon size={14} />
        </Link>
      )}
    </div>
  );
}

// Page header — dark apothecary masthead
export function PageHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <header className={cn("border-b border-line pb-10", align === "center" && "text-center")}>
      {eyebrow && (
        <p className={cn("eyebrow-copper mb-4 flex items-center gap-2", align === "center" && "justify-center")}>
          <span className="h-px w-6 bg-copper/60" aria-hidden />
          {eyebrow}
        </p>
      )}
      <h1
        className={cn(
          "font-display text-display-lg tracking-[-0.025em] text-text",
          align === "center" && "mx-auto max-w-3xl",
        )}
      >
        {title}
      </h1>
      {description && (
        <p className={cn("mt-4 max-w-xl text-[15px] leading-relaxed text-text-muted", align === "center" && "mx-auto")}>
          {description}
        </p>
      )}
    </header>
  );
}

// Breadcrumbs — subtle, warm gray on dark
export function Breadcrumbs({ items, light }: { items: { href?: string; label: string }[]; light?: boolean }) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("text-[11px] uppercase tracking-[0.14em]", light ? "text-text-muted" : "text-text-muted")}>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="transition-colors hover:text-copper">
            Accueil
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <ChevronRightIcon size={10} className="text-text-dim" />
            {it.href ? (
              <Link href={it.href} className="transition-colors hover:text-copper">
                {it.label}
              </Link>
            ) : (
              <span className="text-text" aria-current="page">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Empty state — glass, centered, calm
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "light",
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl px-6 py-20 text-center",
        dark ? "bg-surface border border-line text-text" : "border border-line bg-surface",
      )}
    >
      <span
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full border",
          dark ? "border-line bg-bg-soft text-copper" : "border-line bg-bg-soft text-copper",
        )}
      >
        {icon}
      </span>
      <h3 className={cn("mt-6 font-display text-display-sm tracking-[-0.015em]", dark ? "text-text" : "text-text")}>
        {title}
      </h3>
      {description && <p className={cn("mt-2 max-w-sm text-sm text-text-muted")}>{description}</p>}
      {action && (
        <Link href={action.href} className={cn("mt-8", dark ? "btn-primary" : "btn-secondary rounded-full")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

// Badge — pill, typographic, soft
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "error" | "ink" | "outline";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border border-line bg-surface text-text-muted",
    accent: "bg-copper-soft text-copper border border-copper/15",
    success: "bg-sage-soft text-sage border border-sage/15",
    warning: "bg-copper-soft text-copper border border-copper/15",
    error: "bg-error-soft text-error border border-error/15",
    ink: "bg-text text-bg",
    outline: "border border-line text-text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Quantity stepper — rounded, dark apothecary
export function QtyStepper({
  value,
  onChange,
  max = 20,
  min = 1,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  min?: number;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-10" : "h-11";
  const w = size === "sm" ? "w-9" : "w-11";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-surface p-1", h)} role="group" aria-label="Quantité">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className={cn(
          "flex items-center justify-center rounded-full bg-bg-soft text-text transition-colors hover:bg-surface-2 disabled:opacity-30",
          w,
          h,
        )}
      >
        <MinusIcon size={13} />
      </button>
      <span className="min-w-9 text-center text-sm font-medium tabular-nums text-text" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className={cn(
          "flex items-center justify-center rounded-full bg-text text-bg transition-colors hover:bg-white disabled:opacity-30",
          w,
          h,
        )}
      >
        <PlusIcon size={13} />
      </button>
    </div>
  );
}

// Checkout steps — clean, pill indicators
export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Étapes de commande">
      {steps.map((s, i) => {
        const done = i < current,
          active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums transition-all duration-500",
                done
                  ? "border-copper bg-copper text-bg"
                  : active
                    ? "border-copper bg-copper-soft text-copper"
                    : "border-line bg-surface text-text-dim",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={cn("hidden text-[10px] font-semibold uppercase tracking-[0.14em] sm:block", active ? "text-text" : "text-text-dim")}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <span className={cn("h-px flex-1 transition-colors duration-700", done ? "bg-copper" : "bg-line")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Form field with label / hint / error
export function Field({
  label,
  error,
  children,
  hint,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <label className="block text-left" htmlFor={htmlFor}>
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-text-dim">{hint}</span>}
      {error && (
        <span className="mt-1.5 block text-xs font-medium text-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

// Product grid skeleton — dark
export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rounded-[16px] border border-line bg-surface p-2">
          <div className="skeleton aspect-square rounded-[12px]" />
          <div className="skeleton mt-4 h-2.5 w-1/3" />
          <div className="skeleton mt-2.5 h-4 w-4/5" />
          <div className="skeleton mt-3 h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
