"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CartIcon, HeartIcon, LogoMark, MenuIcon, SearchIcon } from "@/components/icons";
import { useCart } from "@/components/cart/cart-provider";
import type { SafeUser } from "@/lib/auth";
import { SearchOverlay } from "./search-overlay";
import { AnnouncementBar } from "./announcement-bar";
import { AccountMenu } from "./account-menu";
import { MobileDrawer, type NavGroup } from "./mobile-drawer";
import { DesktopNavigation, type MegaGroup } from "./desktop-nav";

function Badge({ n }: { n: number }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.span
          key={n}
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          className="absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-copper px-1 text-[10px] font-bold tabular-nums text-bg shadow-[0_2px_8px_rgba(196,164,132,0.35)]"
        >
          {n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function Header({
  groups,
  mobileGroups,
  user,
  wishlistCount,
}: {
  groups: MegaGroup[];
  mobileGroups: NavGroup[];
  user: SafeUser | null;
  wishlistCount: number;
}) {
  const { count, open } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <AnnouncementBar />

      <header
        className={[
          "sticky top-0 z-40 border-b transition-all duration-500",
          scrolled
            ? "border-line bg-bg/80 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-[16px]"
            : "border-transparent bg-bg",
        ].join(" ")}
      >
        {/* Brand + actions */}
        <div className="container-lux grid h-[68px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
          {/* Mobile menu */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-text transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Logo — refined, tighter */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-text"
            aria-label="Cléopâtre — Espace Santé Beauté, accueil"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-copper/30 bg-copper-soft text-copper transition-colors group-hover:border-copper/50">
              <LogoMark size={20} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[22px] font-[520] tracking-[-0.02em] lg:text-[24px]">
                Cléopâtre
              </span>
              <span className="mt-0.5 hidden text-[8.5px] font-semibold uppercase tracking-[0.28em] text-text-muted sm:block">
                Espace Santé Beauté
              </span>
            </span>
          </Link>

          {/* Desktop search — pill, glass */}
          <button
            onClick={() => setSearchOpen(true)}
            className="group mx-auto hidden h-11 w-full max-w-[420px] items-center gap-3 rounded-full border border-line bg-surface px-5 text-left text-[13px] text-text-dim backdrop-blur transition-all hover:border-line-strong hover:bg-surface-2 hover:text-text-muted lg:flex"
            aria-label="Rechercher un produit, une marque"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-soft text-text-muted transition-colors group-hover:bg-surface-3">
              <SearchIcon size={14} />
            </span>
            <span className="flex-1 truncate">Rechercher un soin, une marque…</span>
            <span className="hidden items-center gap-1 rounded-full border border-line bg-bg px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-text-muted xl:flex">
              <span className="text-[11px]">⌘</span>K
            </span>
          </button>

          {/* Actions */}
          <div className="flex items-center justify-end gap-1.5">
            <AccountMenu user={user} wishlistCount={wishlistCount} />
            <Link
              href={user ? "/compte/favoris" : "/connexion?next=/compte/favoris"}
              aria-label="Favoris"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-text transition-colors hover:border-line hover:bg-surface hover:text-copper"
            >
              <HeartIcon />
              <Badge n={wishlistCount} />
            </Link>
            <button
              onClick={open}
              aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-text text-bg transition-colors hover:bg-white"
            >
              <CartIcon />
              <Badge n={count} />
            </button>
          </div>
        </div>

        {/* Mobile search — rounded pill */}
        <div className="border-t border-line px-4 pb-3 pt-3 lg:hidden">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-full items-center gap-3 rounded-full border border-line bg-surface px-4 text-left text-[13px] text-text-dim"
            aria-label="Rechercher un produit, une marque"
          >
            <SearchIcon size={15} /> Rechercher un soin, une marque…
          </button>
        </div>

        <DesktopNavigation groups={groups} />
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSearch={() => setSearchOpen(true)}
        groups={mobileGroups}
        user={user}
      />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
