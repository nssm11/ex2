"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoutIcon, UserIcon } from "@/components/icons";
import { logoutAction } from "@/actions/auth";
import type { SafeUser } from "@/lib/auth";
import { EASE_LUXE, tweenExit } from "@/lib/motion";

type NavLink = { href: string; label: string; role?: "staff" | "admin" };

const CUSTOMER_LINKS: NavLink[] = [
  { href: "/compte", label: "Mon espace" },
  { href: "/compte/commandes", label: "Mes commandes" },
  { href: "/compte/favoris", label: "Mes favoris" },
  { href: "/compte/retours", label: "Mes retours" },
  { href: "/compte/profil", label: "Profil & adresses" },
];

const STAFF_LINKS: NavLink[] = [
  { href: "/admin", label: "Tableau de bord", role: "staff" },
  { href: "/admin/commandes", label: "Commandes", role: "staff" },
  { href: "/admin/clients", label: "Clients", role: "staff" },
  { href: "/admin/produits", label: "Produits", role: "staff" },
  { href: "/admin/support", label: "Support", role: "staff" },
  { href: "/admin/stock", label: "Stock", role: "staff" },
];

export function AccountMenu({ user, wishlistCount }: { user: SafeUser | null; wishlistCount: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const pathname = usePathname();

  // Close on route change
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isStaff = user && (user.role === "admin" || user.role === "support");
  const links = isStaff ? STAFF_LINKS : CUSTOMER_LINKS;

  return (
    <div ref={ref} className="relative">
      {user ? (
        <button
          ref={buttonRef as React.RefObject<HTMLButtonElement>}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Mon compte — ${user.firstName} ${user.lastName}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-text transition-colors hover:border-line hover:bg-surface hover:text-copper"
        >
          <UserIcon />
        </button>
      ) : (
        <Link
          ref={buttonRef as React.RefObject<HTMLAnchorElement>}
          href="/connexion"
          aria-label="Se connecter"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent text-text transition-colors hover:border-line hover:bg-surface hover:text-copper"
        >
          <UserIcon />
        </Link>
      )}

      <AnimatePresence>
        {open && user && (
          <motion.div
            role="menu"
            initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: EASE_LUXE } }}
            exit={{ opacity: 0, y: 6, scale: 0.98, transition: tweenExit }}
            className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-float backdrop-blur-xl"
          >
            <div className="border-b border-line bg-bg-soft px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-copper">Bonjour</p>
              <p className="mt-1 font-display text-[18px] font-[550] italic leading-tight tracking-[-0.01em] text-text">
                {user.firstName} {user.lastName}
              </p>
              {isStaff && (
                <p className="mt-1 inline-flex rounded-full border border-copper/20 bg-copper-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-copper">
                  {user.role === "admin" ? "Administrateur" : "Support"}
                </p>
              )}
            </div>
            <nav className="p-2" aria-label="Menu compte">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  role="menuitem"
                  className="flex items-center justify-between rounded-full px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-soft hover:text-text"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            {isStaff && (
              <Link
                href="/compte"
                className="mx-2 mb-2 block rounded-full border border-line bg-bg-soft px-3 py-2 text-center text-xs font-medium text-text-muted hover:bg-surface"
              >
                Espace client
              </Link>
            )}
            <form action={logoutAction} className="border-t border-line bg-bg-soft/50 p-2">
              <button
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface hover:text-error"
              >
                <LogoutIcon size={14} />
                Déconnexion
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
