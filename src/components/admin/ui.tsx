import type { ReactNode } from "react";
import { ORDER_STATUS_LABELS } from "@/lib/order-constants";
import type { OrderStatus } from "@/db/schema";
import { cn } from "@/lib/utils";

// Page shell — dark lab, copper hairline
export function AdminPage({
  title,
  sub,
  action,
  children,
  eyebrow,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-admin-border bg-admin-panel px-5 py-5 sm:px-6">
        <div>
          {eyebrow && (
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-admin-gold/20 bg-admin-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-gold">
              <span className="h-1 w-1 rounded-full bg-admin-gold" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-[26px] font-[560] tracking-[-0.015em] text-admin-text">{title}</h1>
          {sub && <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-admin-muted">{sub}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
      </div>
      {children}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-admin-border bg-admin-panel shadow-[0_8px_24px_rgba(0,0,0,0.25)]", className)}>
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-admin-border bg-admin-panel-2/60 px-5 py-3.5 backdrop-blur">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-muted">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// Data table — clinical, rounded, dark
export function Table({
  head,
  children,
  minWidth = "min-w-[720px]",
}: {
  head: string[];
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-panel">
      <div className="overflow-x-auto">
        <table className={cn("w-full border-collapse text-[13px]", minWidth)}>
          <thead>
            <tr className="border-b border-admin-border bg-admin-panel-2/50 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-admin-muted">
              {head.map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border/70">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

// Status badge — pill, copper/sage semantic
const tones: Record<OrderStatus, string> = {
  pending: "bg-copper-soft text-copper border-copper/15",
  confirmed: "bg-copper-soft text-copper border-copper/15",
  preparing: "bg-copper-soft text-copper border-copper/15",
  shipped: "bg-admin-panel-2 text-admin-muted border-admin-border",
  delivered: "bg-sage-soft text-sage border-sage/15",
  cancelled: "bg-error-soft text-error border-error/15",
  returned: "bg-error-soft text-error border-error/15",
};
export function StatusBadge({ s, className }: { s: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        tones[s],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[s]}
    </span>
  );
}

// KPIs — glass card, copper top hairline
export function KPI({
  label,
  value,
  sub,
  tone = "text-admin-text",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-admin-border bg-admin-panel p-5 shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-admin-gold/40 to-transparent" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-muted">{label}</p>
      <p className={cn("mt-3 font-display text-[2rem] font-[560] leading-none tracking-tight", tone)}>{value}</p>
      {sub && <p className="mt-2 text-xs text-admin-muted">{sub}</p>}
    </div>
  );
}

// Inputs — rounded, dark apothecary
export const afield =
  "w-full min-h-11 rounded-xl border border-admin-border bg-admin-bg px-3.5 py-2 text-sm text-admin-text placeholder:text-admin-dim focus:border-admin-gold focus:outline-none focus:ring-2 focus:ring-admin-gold/15 transition-colors";
export const abtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-admin-gold px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-admin-bg shadow-[0_4px_16px_rgba(196,164,132,0.22)] transition-colors hover:bg-[#D1B196] disabled:opacity-40";
export const abtnGhost =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-admin-border bg-transparent px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-admin-text transition-colors hover:border-admin-gold/30 hover:bg-admin-panel-2 hover:text-admin-gold disabled:opacity-40";
export const abtnDanger =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-error/30 bg-error-soft px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-error transition-colors hover:bg-error hover:text-white disabled:opacity-40";

export function AField({ label, children, error, hint }: { label: string; children: ReactNode; error?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[11px] text-admin-dim">{hint}</span>}
      {error && (
        <span className="mt-1 block text-[11px] text-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-admin-muted", className)}>{children}</h2>;
}
