import type { Metadata } from "next";
import Link from "next/link";
import { RoutineBuilder } from "@/components/routine/routine-builder";
import { PageIntro } from "@/components/shell/page-intro";
import { ShieldIcon, SparkIcon, ChatIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Routine sur-mesure — Modern Apothecary",
  description:
    "Créez votre routine en 60 secondes : 3 produits validés par nos pharmaciens, adaptés à votre peau, à vos besoins et à vos préférences.",
};

export default function RoutinePage() {
  return (
    <div>
      <PageIntro
        index="Routine Builder"
        kicker="Flagship · Modern Apothecary"
        title={
          <>
            Votre routine, <em className="italic font-[350] text-copper">prescrite avec justesse.</em>
          </>
        }
        intro="Pas de routine à 7 produits. Trois gestes, cohérents, expliqués — nettoyant, soin, protection. Validés par nos pharmaciens de Ezzahra & Hammam-Lif."
        breadcrumbs={[{ label: "Routine" }]}
        right={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/20 bg-sage-soft px-3 py-1.5 text-xs font-medium text-sage">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Sans jargon
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-copper/20 bg-copper-soft px-3 py-1.5 text-xs font-medium text-copper">
              60 s · 4 questions
            </span>
          </>
        }
      />

      <div className="container-lux py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RoutineBuilder />
          </div>

          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-copper">
                <ShieldIcon size={13} /> Pourquoi nous croire ?
              </p>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-muted">
                <li className="flex gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-copper" />
                  Sélection resserrée — chaque produit a une raison d’être en rayon.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-copper" />
                  Tolérance prioritaire — pas d’actif irritant sans raison.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-sage" />
                  Prix justes — remises réelles, jamais gonflées.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-bg-soft p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-text">
                <ChatIcon size={14} className="text-copper" /> Besoin d’un humain ?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Nos pharmaciens vous répondent au <a href="tel:+21671450210" className="font-medium text-copper hover:underline">71 450 210</a> ou en boutique. Décrivez votre peau, on ajuste la routine ensemble.
              </p>
              <Link href="/aide" className="mt-3 inline-flex rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-text hover:bg-surface-2">
                Voir l’aide & FAQ
              </Link>
            </div>

            <div className="rounded-2xl border border-copper/15 bg-copper-soft p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-copper">
                <SparkIcon size={14} /> Quiet loyalty
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Pas de points criards. À chaque commande, une attention discrète glissée dans votre colis — et des conseils, pas des spams.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
