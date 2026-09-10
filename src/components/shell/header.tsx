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
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-pill bg-vert px-1 text-[10px] font-semibold tabular-nums text-cream"
        >
          {n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function Header({ groups, mobileGroups, user, wishlistCount }: {
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
    const onScroll = () => setScrolled(window.scrollY > 8);
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
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled ? "border-stone bg-paper/95 shadow-whisper backdrop-blur-xl" : "border-transparent bg-paper"
        }`}
      >
        <div className="container-lux grid h-16 grid-cols-[auto_1fr_auto] items-center gap-1 sm:gap-3 lg:h-[4.5rem] lg:gap-8">
          {/* Menu (mobile) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center text-ink transition-colors duration-300 hover:text-vert sm:h-11 sm:w-11"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="group flex min-w-0 items-center justify-center gap-2 text-ink sm:justify-start sm:gap-3" aria-label="Cléopâtre — Espace Santé Beauté, accueil">
            <LogoMark size={24} className="size-6 shrink-0 text-vert transition-colors duration-500 group-hover:text-sage-2 sm:size-7" />
            <span className="flex flex-col leading-none">
              <span className="whitespace-nowrap font-display text-[clamp(1rem,4.8vw,1.3125rem)] font-medium tracking-[0.01em] lg:text-[25px]">Cléopâtre</span>
              <span className="mt-1 hidden text-[9px] font-semibold tracking-[0.14em] text-sage-2 sm:block">Espace Santé Beauté</span>
            </span>
          </Link>

          {/* Recherche (desktop) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="mx-auto hidden h-11 w-full max-w-sm items-center gap-3 rounded-sm border border-stone bg-cream/70 px-4 text-left text-[13px] text-muted transition-all duration-300 hover:border-sage hover:bg-cream focus-visible:border-vert-3 xl:max-w-md lg:flex"
            aria-label="Rechercher un produit, une marque"
          >
            <SearchIcon size={16} className="shrink-0 text-sage-2" />
            <span className="truncate">Rechercher un produit, une marque…</span>
          </button>

          {/* Actions */}
          <div className="flex items-center justify-end gap-0 sm:gap-0.5">
            <AccountMenu user={user} wishlistCount={wishlistCount} />
            <Link
              href={user ? "/compte/favoris" : "/connexion?next=/compte/favoris"}
              aria-label="Favoris"
              className="relative flex h-10 w-10 items-center justify-center text-ink transition-colors duration-300 hover:text-vert sm:h-11 sm:w-11"
            >
              <HeartIcon />
              <Badge n={wishlistCount} />
            </Link>
            <button
              onClick={open}
              aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}
              className="relative flex h-10 w-10 items-center justify-center text-ink transition-colors duration-300 hover:text-vert sm:h-11 sm:w-11"
            >
              <CartIcon />
              <Badge n={count} />
            </button>
          </div>
        </div>

        {/* Recherche (mobile) */}
        <div className="border-t border-stone/60 px-4 pb-2 pt-1.5 lg:hidden">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-full items-center gap-3 rounded-sm border border-stone bg-cream/70 px-4 text-left text-[13px] text-muted transition-colors duration-300 hover:border-sage"
            aria-label="Rechercher un produit, une marque"
          >
            <SearchIcon size={15} className="shrink-0 text-sage-2" />
            <span className="truncate">Rechercher un produit, une marque…</span>
          </button>
        </div>

        <DesktopNavigation groups={groups} />
      </header>

      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => setSearchOpen(true)} groups={mobileGroups} user={user} />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
