"use client";
import { useEffect, useRef, useState } from "react";

// Sentence case, like the rest of the interface — no shouting in capitals.
const MESSAGES_MOBILE = [
  "Livraison offerte dès 99 DT",
  "Conseil pharmaceutique · 71 450 210",
  "Paiement à la livraison",
  "Produits 100 % authentiques",
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
    <div className="relative z-50 border-b border-stone/60 bg-cream">
      {/* Desktop: single elegant line */}
      <div className="hidden lg:block">
        <div className="container-lux flex min-h-8 items-center justify-center gap-6 text-[10px] font-semibold tracking-[0.02em] text-muted">
          <span>Livraison offerte dès 99&nbsp;DT</span>
          <span className="text-stone-2" aria-hidden="true">·</span>
          <span>Conseil pharmaceutique</span>
          <span className="text-stone-2" aria-hidden="true">·</span>
          <span>Paiement à la livraison</span>
          <span className="text-stone-2" aria-hidden="true">·</span>
          <span>Service client 71&nbsp;450&nbsp;210</span>
        </div>
      </div>
      {/* Mobile: horizontal scroll, never overflows */}
      <div className="lg:hidden">
        <div
          ref={scrollRef}
          className="no-scrollbar-x flex items-center gap-6 overflow-x-auto whitespace-nowrap px-4 py-2 text-[10px] font-semibold tracking-[0.02em] text-muted"
        >
          {MESSAGES_MOBILE.map((m, i) => (
            <span key={m} className="flex shrink-0 items-center gap-6">
              {m}
              {i < MESSAGES_MOBILE.length - 1 && <span className="text-stone-2" aria-hidden="true">·</span>}
            </span>
          ))}
          {canScroll && <span className="sr-only">Faites défiler pour voir plus de messages.</span>}
        </div>
      </div>
    </div>
  );
}
