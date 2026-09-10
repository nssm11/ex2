"use client";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { CartIcon, CloseIcon, HeartIcon, SearchIcon, UserIcon, ArrowRightIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/icons";
import type { SafeUser } from "@/lib/auth";

type NavChild = { id: number; slug: string; name: string };
export type NavGroup = {
  id: number;
  slug: string;
  name: string;
  href: string;
  description: string | null;
  children: NavChild[];
};

const PRIMARY_NAV = [
  { href: "/boutique?sort=newest", label: "Nouveautés" },
];

export function MobileDrawer({
  open,
  onClose,
  onSearch,
  groups,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
  groups: NavGroup[];
  user: SafeUser | null;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Fermer le menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            initial={reduce ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 210, damping: 32 }}
            className="fixed inset-y-0 left-0 z-[60] flex w-[88vw] max-w-sm flex-col bg-paper shadow-drawer lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone px-5">
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl text-ink">Cléopâtre</span>
                <span className="mt-1.5 text-[9px] font-semibold tracking-[0.16em] text-sage-2">Espace Santé Beauté</span>
              </span>
              <button
                onClick={onClose}
                aria-label="Fermer le menu"
                className="flex h-11 w-11 items-center justify-center text-ink transition-colors duration-300 hover:text-vert"
              >
                <CloseIcon />
              </button>
            </div>

            <button
              onClick={() => { onClose(); onSearch(); }}
              className="mx-5 mt-4 flex h-12 shrink-0 items-center gap-3 rounded-sm border border-stone bg-cream/70 px-4 text-left text-sm text-muted transition-colors duration-300 hover:border-sage"
            >
              <SearchIcon size={16} /> Rechercher un produit, une marque…
            </button>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/boutique?sort=newest"
                    onClick={onClose}
                    className="flex min-h-[52px] items-center justify-between border-b border-stone/60 py-3 text-[15px] font-semibold tracking-[0.04em] text-vert"
                  >
                    Nouveautés
                    <ChevronRightIcon size={14} />
                  </Link>
                </li>
                {groups.map((g) => (
                  <li key={g.id}>
                    <details className="group border-b border-stone/50">
                      <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between py-3 font-display text-[17px] text-ink">
                        {g.name}
                        <ChevronDownIcon size={16} className="text-muted transition-transform duration-300 group-open:rotate-180" />
                      </summary>
                      <ul className="mb-4 space-y-0.5 pl-1">
                        <li>
                          <Link
                            href={g.href}
                            onClick={onClose}
                            className="flex min-h-[44px] items-center justify-between text-[14px] font-semibold text-vert"
                          >
                            Tout {g.name.toLowerCase()}
                            <ArrowRightIcon size={13} />
                          </Link>
                        </li>
                        {g.children.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/categorie/${c.slug}`}
                              onClick={onClose}
                              className="block min-h-[44px] py-2 pl-2 text-[14px] text-charcoal"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
                <li>
                  <Link
                    href="/promotions"
                    onClick={onClose}
                    className="flex min-h-[52px] items-center justify-between border-b border-stone/60 py-3 text-[15px] font-semibold tracking-[0.04em] text-vert"
                  >
                    Offres
                    <ChevronRightIcon size={14} />
                  </Link>
                </li>
              </ul>

              <div className="mt-6 space-y-1">
                <p className="eyebrow px-1 pb-2">Mon espace</p>
                <Link
                  href="/panier"
                  onClick={onClose}
                  className="flex min-h-[46px] items-center gap-3 px-3 text-[14px] text-ink"
                >
                  <CartIcon size={16} className="text-vert" /> Mon panier
                </Link>
                {user ? (
                  <>
                    <Link
                      href={user.role === "admin" || user.role === "support" ? "/admin" : "/compte"}
                      onClick={onClose}
                      className="flex min-h-[46px] items-center gap-3 px-3 text-[14px] text-ink"
                    >
                      <UserIcon size={16} className="text-vert" />
                      Mon espace
                    </Link>
                    <Link
                      href="/compte/commandes"
                      onClick={onClose}
                      className="flex min-h-[46px] items-center gap-3 px-3 text-[14px] text-charcoal"
                    >
                      Mes commandes
                    </Link>
                    <Link
                      href="/compte/favoris"
                      onClick={onClose}
                      className="flex min-h-[46px] items-center gap-3 px-3 text-[14px] text-charcoal"
                    >
                      <HeartIcon size={16} className="text-vert" />
                      Mes favoris
                    </Link>
                    {(user.role === "admin" || user.role === "support") && (
                      <Link
                        href="/admin/support"
                        onClick={onClose}
                        className="flex min-h-[46px] items-center gap-3 px-3 text-[14px] text-charcoal"
                      >
                        Support
                      </Link>
                    )}
                  </>
                ) : (
                  <Link
                    href="/connexion"
                    onClick={onClose}
                    className="btn-primary mt-2 w-full"
                  >
                    Se connecter
                  </Link>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-stone bg-cream px-5 py-4">
              <div className="flex items-center justify-between text-micro font-semibold tracking-[0.08em] text-muted">
                <span>Conseil 71 450 210</span>
                <span>Livraison 24–72 h</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
