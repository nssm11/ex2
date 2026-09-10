"use client";
import Link from "next/link";
import { useActionState } from "react";
import {
  ArrowRightIcon,
  BankIcon,
  CardIcon,
  CashIcon,
  LogoMark,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/icons";
import { subscribeNewsletterAction } from "@/actions/shop";
import type { Store } from "@/db/schema";

export function Footer({
  universes,
  stores,
}: {
  universes: { slug: string; name: string }[];
  stores: Store[];
}) {
  const [state, action, pending] = useActionState(subscribeNewsletterAction, null);
  return (
    <footer className="border-t border-line bg-bg-soft">
      {/* Statement — apothecary manifesto */}
      <div className="border-b border-line">
        <div className="container-lux grid gap-10 py-14 lg:grid-cols-12 lg:items-end lg:py-16">
          <div className="lg:col-span-7">
            <p className="eyebrow-copper mb-4 flex items-center gap-2">
              <span className="h-px w-6 bg-copper/60" aria-hidden /> La maison Cléopâtre
            </p>
            <p className="font-display text-display-md leading-[0.95] tracking-[-0.02em] text-text sm:text-display-lg">
              La santé de la peau <span className="italic font-[360] text-copper">mérite une maison.</span>
            </p>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-text-muted lg:col-span-5 lg:pb-1.5">
            Depuis Ezzahra et Hammam-Lif, nos pharmaciennes et pharmaciens sélectionnent chaque
            référence — authentique, tolérante, utile — et vous la livrent partout en Tunisie.
          </p>
        </div>
      </div>

      <div className="container-lux grid gap-12 py-12 lg:grid-cols-12 lg:gap-10 lg:py-14">
        {/* Brand + newsletter — elevated card */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-copper/25 bg-copper-soft text-copper">
                <LogoMark size={22} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-[22px] font-[550] tracking-[-0.01em] text-text">Cléopâtre</span>
                <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.28em] text-text-muted">
                  Espace Santé Beauté
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Parapharmacie premium fondée à Ezzahra. Une sélection resserrée, un conseil de
              pharmacien, aucune promesse excessive.
            </p>

            <form action={action} className="mt-7" aria-label="Inscription au Journal">
              <label htmlFor="nl" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                Le Journal, chaque mois
              </label>
              <div className="flex overflow-hidden rounded-full border border-line bg-bg p-1 transition-colors focus-within:border-copper/40 focus-within:ring-2 focus-within:ring-copper/10">
                <input
                  id="nl"
                  name="email"
                  type="email"
                  required
                  placeholder="Votre adresse e-mail"
                  className="min-h-10 w-full bg-transparent px-4 text-sm text-text placeholder:text-text-dim focus:outline-none"
                />
                <button
                  disabled={pending}
                  aria-label="S'inscrire à la newsletter"
                  className="flex shrink-0 items-center gap-2 rounded-full bg-text px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-bg transition-colors hover:bg-white disabled:opacity-40"
                >
                  {pending ? "…" : "S'inscrire"} <ArrowRightIcon size={13} />
                </button>
              </div>
              {state && (
                <p
                  className={`mt-2 text-xs ${state.ok ? "text-sage" : "text-error"}`}
                  role="status"
                >
                  {state.ok ? state.message : state.error}
                </p>
              )}
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-soft px-3 py-1.5 text-[11px] text-text-muted">
                <ShieldIcon size={12} className="text-sage" /> Authentique
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-soft px-3 py-1.5 text-[11px] text-text-muted">
                <TruckIcon size={12} className="text-copper" /> 24–72h
              </span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">Univers</p>
            <ul className="space-y-3 text-sm">
              {universes.map((u) => (
                <li key={u.slug}>
                  <Link href={`/univers/${u.slug}`} className="text-text-muted transition-colors hover:text-copper">
                    {u.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/marques" className="text-text-muted transition-colors hover:text-copper">
                  Toutes les marques
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">La maison</p>
            <ul className="space-y-3 text-sm">
              {[
                ["/promotions", "Offres du moment"],
                ["/journal", "Le Journal"],
                ["/boutiques", "Nos boutiques"],
                ["/aide", "Aide & FAQ"],
                ["/suivi", "Suivre ma commande"],
                ["/livraison", "Livraison & retours"],
              ].map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="text-text-muted transition-colors hover:text-copper">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">Nos boutiques</p>
            <ul className="space-y-5 text-sm">
              {stores.map((s) => (
                <li key={s.id} className="rounded-xl border border-line bg-surface/50 p-3.5 backdrop-blur">
                  <p className="font-medium text-text">{s.name}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                    <MapPinIcon size={11} className="text-copper" />
                    {s.address} · {s.city}
                  </p>
                  <p className="mt-1 text-xs text-text-dim">{s.hours}</p>
                  <a href={`tel:+216${s.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-copper hover:text-copper-deep">
                    <PhoneIcon size={11} /> {s.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Legal — minimal, clinical */}
      <div className="border-t border-line">
        <div className="container-lux flex flex-col gap-5 py-6 text-xs text-text-dim lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
              <ShieldIcon size={12} className="text-sage" /> Authentiques
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
              <TruckIcon size={12} className="text-copper" /> 24–72h
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5">
              <CashIcon size={12} className="text-copper" /> Paiement à la livraison
            </span>
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 sm:inline-flex">
              <BankIcon size={12} className="text-text-muted" /> Virement
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[11px] uppercase tracking-[0.08em]">
            <Link href="/cgv" className="transition-colors hover:text-copper">
              CGV
            </Link>
            <Link href="/confidentialite" className="transition-colors hover:text-copper">
              Confidentialité
            </Link>
            <Link href="/journal" className="transition-colors hover:text-copper">
              Journal
            </Link>
            <span className="normal-case tracking-normal text-text-dim">© {new Date().getFullYear()} Cléopâtre</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
