"use client";
import { useEffect, useRef, useState } from "react";

// Phrasé en casse normale, comme le reste de l'interface.
const MESSAGES_MOBILE = [
  "Livraison offerte dès 99 DT",
  "Conseil pharmaceutique · 71 450 210",
  "Paiement à la livraison",
  "Produits 100 % authentiques",
];

/**
 * Bandeau d'information — premier contact avec la marque.
 * Fond vert officinal : c'est la seule bande qui porte l'identité à pleine
 * intensité, tout le reste de la page reste en ivoire.
 */
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
    <div className="relative z-50 bg-vert text-cream">
      {/* Desktop : une seule ligne, centrée */}
      <div className="hidden lg:block">
        <div className="container-lux flex min-h-9 items-center justify-center gap-7 text-micro font-semibold tracking-[0.1em] text-cream/85">
          <span>Livraison offerte dès 99&nbsp;DT</span>
          <span className="text-cream/30" aria-hidden="true">
            ·
          </span>
          <span>Conseil pharmaceutique</span>
          <span className="text-cream/30" aria-hidden="true">
            ·
          </span>
          <span>Paiement à la livraison</span>
          <span className="text-cream/30" aria-hidden="true">
            ·
          </span>
          <span>Service client 71&nbsp;450&nbsp;210</span>
        </div>
      </div>
      {/* Mobile : défilement horizontal, jamais de débordement */}
      <div className="lg:hidden">
        <div
          ref={scrollRef}
          className="no-scrollbar-x flex items-center gap-6 overflow-x-auto whitespace-nowrap px-4 py-2 text-micro font-semibold tracking-[0.08em] text-cream/85"
        >
          {MESSAGES_MOBILE.map((m, i) => (
            <span key={m} className="flex shrink-0 items-center gap-6">
              {m}
              {i < MESSAGES_MOBILE.length - 1 && (
                <span className="text-cream/30" aria-hidden="true">
                  ·
                </span>
              )}
            </span>
          ))}
          {canScroll && <span className="sr-only">Faites défiler pour voir plus de messages.</span>}
        </div>
      </div>
    </div>
  );
}
