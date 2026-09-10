"use client";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRightIcon, BankIcon, CardIcon, CashIcon, LogoMark, MapPinIcon, PhoneIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { subscribeNewsletterAction } from "@/actions/shop";
import type { Store } from "@/db/schema";

const MAISON_LINKS: [string, string][] = [
  ["/promotions", "Offres du moment"],
  ["/journal", "Le Journal"],
  ["/boutiques", "Nos boutiques"],
  ["/aide", "Aide & FAQ"],
  ["/suivi", "Suivre ma commande"],
  ["/livraison", "Livraison & retours"],
];

const TRUST = [
  { i: ShieldIcon, t: "Produits authentiques" },
  { i: TruckIcon, t: "Livraison 24–72 h" },
  { i: CashIcon, t: "Paiement à la livraison" },
  { i: BankIcon, t: "Virement" },
  { i: CardIcon, t: "Carte — bientôt" },
];

export function Footer({ universes, stores }: { universes: { slug: string; name: string }[]; stores: Store[] }) {
  const [state, action, pending] = useActionState(subscribeNewsletterAction, null);
  return (
    <footer className="bg-vert text-cream">
      {/* Bandeau d'intention */}
      <div className="border-b border-cream/12">
        <div className="container-lux flex flex-col gap-10 py-16 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow mb-6 text-cream/45">La maison Cléopâtre</p>
            <p className="font-display text-display-md italic leading-tight text-balance text-cream sm:text-display-lg">
              La santé de la peau mérite une maison.
            </p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/65 lg:pb-2">
            Depuis Ezzahra et Hammam-Lif, nos pharmaciennes et pharmaciens sélectionnent chaque référence — authentique, tolérante, utile — et vous la livrent
            partout en Tunisie.
          </p>
        </div>
      </div>

      <div className="container-lux grid gap-14 py-16 lg:grid-cols-12 lg:gap-10">
        {/* Marque + newsletter */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <LogoMark size={32} className="text-sage-3" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[26px] font-medium tracking-[0.01em]">Cléopâtre</span>
              <span className="mt-1.5 text-[9px] font-semibold tracking-[0.16em] text-cream/45">Espace Santé Beauté</span>
            </span>
          </div>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/65">
            Parapharmacie premium fondée à Ezzahra. Une sélection resserrée, un conseil de pharmacien, aucune promesse excessive.
          </p>

          <form action={action} className="mt-9 max-w-sm" aria-label="Inscription au Journal">
            <label htmlFor="nl" className="eyebrow mb-4 block text-sage-3">
              Le Journal, chaque mois
            </label>
            <div className="flex border-b border-cream/30 transition-colors duration-300 focus-within:border-sage-3">
              <input
                id="nl"
                name="email"
                type="email"
                required
                placeholder="Votre adresse e-mail"
                className="min-h-12 w-full bg-transparent text-sm text-cream placeholder:text-cream/35 focus:outline-none"
              />
              <button
                disabled={pending}
                aria-label="S'inscrire à la newsletter"
                className="flex shrink-0 items-center gap-2 px-2 text-micro font-semibold tracking-[0.1em] text-sage-3 transition-colors duration-300 hover:text-cream disabled:opacity-40"
              >
                {pending ? "…" : "S'inscrire"} <ArrowRightIcon size={13} />
              </button>
            </div>
            {state && (
              <p className={`mt-2.5 text-xs ${state.ok ? "text-sage-3" : "text-champagne-3"}`} role="status">
                {state.ok ? state.message : state.error}
              </p>
            )}
          </form>
        </div>

        {/* Colonnes de liens */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-10 lg:col-span-8">
          <div>
            <p className="eyebrow mb-6 text-cream/45">Univers</p>
            <ul className="space-y-3.5 text-sm">
              {universes.map((u) => (
                <li key={u.slug}>
                  <Link href={`/univers/${u.slug}`} className="text-cream/80 transition-colors duration-300 hover:text-cream">
                    {u.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/marques" className="text-cream/80 transition-colors duration-300 hover:text-cream">
                  Toutes les marques
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-6 text-cream/45">La maison</p>
            <ul className="space-y-3.5 text-sm">
              {MAISON_LINKS.map(([h, l]) => (
                <li key={h}>
                  <Link href={h} className="text-cream/80 transition-colors duration-300 hover:text-cream">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="eyebrow mb-6 text-cream/45">Nos boutiques</p>
            <ul className="space-y-6 text-sm">
              {stores.map((s) => (
                <li key={s.id}>
                  <p className="font-medium text-cream">{s.name}</p>
                  <p className="mt-1.5 text-cream/60">
                    <MapPinIcon size={12} className="mr-1.5 inline text-sage-3" />
                    {s.address} · {s.city}
                  </p>
                  <p className="mt-1 text-xs text-cream/40">{s.hours}</p>
                  <a
                    href={`tel:+216${s.phone}`}
                    className="mt-2.5 inline-flex min-h-10 items-center gap-2 text-cream/80 transition-colors duration-300 hover:text-cream"
                  >
                    <PhoneIcon size={13} className="text-sage-3" /> {s.phone.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mentions légales */}
      <div className="bg-vert-2">
        <div className="container-lux flex flex-col gap-6 py-7 text-xs text-cream/55 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {TRUST.map((x) => (
              <span key={x.t} className="inline-flex items-center gap-2">
                <x.i size={14} className="text-sage-3" /> {x.t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/cgv" className="transition-colors duration-300 hover:text-cream">
              CGV
            </Link>
            <Link href="/confidentialite" className="transition-colors duration-300 hover:text-cream">
              Confidentialité
            </Link>
            <Link href="/journal" className="transition-colors duration-300 hover:text-cream">
              Journal
            </Link>
            <span>© {new Date().getFullYear()} Cléopâtre — Espace Santé Beauté</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
