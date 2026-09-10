"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons";
import { EASE_LUXE, tweenExit } from "@/lib/motion";

export type MegaColumn = { heading: string; items: { slug: string; name: string; href: string }[] };
export type MegaGroup = {
  id: string;
  label: string;
  href: string;
  description?: string;
  image?: string | null;
  columns: MegaColumn[];
  callout?: { href: string; label: string };
};

export function DesktopNavigation({ groups }: { groups: MegaGroup[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setActiveId(null);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enter = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveId(id);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setActiveId(null), 160);
  };
  const active = groups.find((g) => g.id === activeId);

  return (
    <nav
      className="relative hidden border-t border-line lg:block"
      aria-label="Navigation principale"
      onMouseLeave={leave}
    >
      <div className="container-lux flex items-center justify-center gap-7 xl:gap-9">
        <Link
          href="/boutique?sort=newest"
          onMouseEnter={() => setActiveId(null)}
          className="relative whitespace-nowrap py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-text"
        >
          Nouveautés
        </Link>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onMouseEnter={() => enter(g.id)}
            onFocus={() => enter(g.id)}
            onClick={() => {
              window.location.href = g.href;
            }}
            aria-expanded={activeId === g.id}
            aria-haspopup="true"
            className={[
              "group relative whitespace-nowrap py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
              activeId === g.id ? "text-copper" : "text-text-muted hover:text-text",
            ].join(" ")}
          >
            {g.label}
            <span
              className={[
                "absolute inset-x-0 -bottom-px h-px bg-copper transition-transform duration-300",
                activeId === g.id ? "scale-x-100" : "scale-x-0",
              ].join(" ")}
            />
          </button>
        ))}
        <Link
          href="/promotions"
          onMouseEnter={() => setActiveId(null)}
          className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-copper/20 bg-copper-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-copper transition-colors hover:border-copper/30 hover:bg-copper/15"
        >
          Offres
        </Link>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.34, ease: EASE_LUXE } }}
            exit={{ opacity: 0, transition: tweenExit }}
            onMouseEnter={() => enter(active.id)}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-bg-soft/95 shadow-float backdrop-blur-[18px] lg:block"
          >
            <div className="container-lux grid grid-cols-12 gap-10 py-9">
              <div className="col-span-8">
                <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                  {active.columns.map((col) => (
                    <div
                      key={col.heading}
                      className="rounded-xl border border-line/60 bg-surface/50 p-4 backdrop-blur"
                    >
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-copper">
                        {col.heading}
                      </p>
                      <ul className="space-y-0.5">
                        {col.items.map((it) => (
                          <li key={it.slug}>
                            <Link
                              href={it.href}
                              className="group flex items-center gap-2 rounded-full px-2 py-1.5 text-[13px] text-text-muted transition-colors hover:bg-surface hover:text-text"
                            >
                              {it.name}
                              <ArrowRightIcon
                                size={11}
                                className="ml-auto text-copper opacity-0 transition-opacity group-hover:opacity-100"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {active.callout && (
                  <Link href={active.callout.href} className="btn-secondary mt-6 rounded-full">
                    {active.callout.label} <ArrowRightIcon size={13} />
                  </Link>
                )}
              </div>
              <div className="col-span-4 rounded-2xl border border-line bg-surface p-5">
                {active.image && (
                  <Link href={active.href} className="block overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={active.image}
                      alt=""
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </Link>
                )}
                <Link href={active.href} className="group mt-4 block">
                  <h3 className="font-display text-[22px] font-[500] leading-none tracking-[-0.02em] text-text transition-colors group-hover:text-copper">
                    {active.label}
                  </h3>
                </Link>
                {active.description && (
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{active.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
