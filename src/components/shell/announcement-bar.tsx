"use client";
import { useEffect, useRef, useState } from "react";

const MESSAGES_DESKTOP = [
  "LIVRAISON OFFERTE DÈS 99 DT",
  "CONSEIL PHARMACEUTIQUE · 71 450 210",
  "PAIEMENT À LA LIVRAISON",
  "PRODUITS 100 % AUTHENTIQUES",
];

export function AnnouncementBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative z-50 border-b border-line bg-bg-muted">
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="container-lux flex min-h-[36px] items-center justify-center gap-5 text-[10.5px] font-medium uppercase tracking-[0.16em] text-text-muted">
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-sage" aria-hidden />
            Livraison offerte dès 99&nbsp;DT
          </span>
          <span className="h-3 w-px bg-line" aria-hidden />
          <span>Conseil pharmaceutique</span>
          <span className="h-3 w-px bg-line" aria-hidden />
          <span>Paiement à la livraison</span>
          <span className="h-3 w-px bg-line" aria-hidden />
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-copper" aria-hidden />
            Service client 71&nbsp;450&nbsp;210
          </span>
        </div>
      </div>
      {/* Mobile */}
      <div className="lg:hidden">
        <div
          ref={scrollRef}
          className="no-scrollbar-x flex items-center gap-5 overflow-x-auto whitespace-nowrap px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted"
        >
          {MESSAGES_DESKTOP.map((m, i) => (
            <span key={m} className="flex shrink-0 items-center gap-5">
              {m}
              {i < MESSAGES_DESKTOP.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-line-strong" aria-hidden />
              )}
            </span>
          ))}
          {canScroll && <span className="sr-only">Faites défiler pour voir plus</span>}
        </div>
      </div>
    </div>
  );
}
