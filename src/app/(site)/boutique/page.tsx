import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Listing, type SP } from "@/components/catalog/listing";
import { getUniverses } from "@/lib/catalog";
import { ProductGridSkeleton } from "@/components/ui/primitives";
import { PageIntro } from "@/components/shell/page-intro";
import { ArrowRightIcon, SparkIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Toute la sélection Cléopâtre : dermo-cosmétique, solaire, cheveux, bébé & maman, compléments — produits authentiques conseillés par nos pharmaciens.",
};
export const dynamic = "force-dynamic";

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<SP> }) {
  const [sp, universes] = await Promise.all([searchParams, getUniverses()]);
  return (
    <div className="border-b border-line bg-bg">
      <PageIntro
        index="La boutique"
        kicker="Toute la sélection"
        title={
          <>
            La boutique <em className="italic font-[350] text-copper">Cléopâtre</em>
          </>
        }
        intro="Chaque référence est choisie par nos pharmaciens pour sa tolérance, son efficacité et son authenticité. Filtrez par univers, marque, besoin ou prix — la sélection reste humaine."
        right={
          <Link href="/routine" className="inline-flex items-center gap-2 rounded-full bg-copper px-5 py-2.5 text-sm font-semibold text-bg hover:bg-[#D1B196]">
            <SparkIcon size={14} /> Trouver ma routine
          </Link>
        }
      />
      <div className="container-lux pt-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:flex-wrap">
          {universes.map((u) => (
            <Link
              key={u.id}
              href={`/univers/${u.slug}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:border-copper/30 hover:bg-surface-2 hover:text-copper"
            >
              {u.name} <ArrowRightIcon size={11} className="opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
          <Link
            href="/routine"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-copper px-4 py-2 text-xs font-semibold text-bg hover:bg-[#D1B196]"
          >
            Routine Builder <SparkIcon size={12} />
          </Link>
          <Link
            href="/promotions"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-copper/20 bg-copper-soft px-4 py-2 text-xs font-semibold text-copper hover:bg-copper hover:text-bg"
          >
            Offres <ArrowRightIcon size={11} />
          </Link>
        </div>
      </div>
      <div className="container-lux py-8 lg:py-10">
        <Suspense fallback={<ProductGridSkeleton />}>
          <Listing base={{}} sp={sp} basePath="/boutique" />
        </Suspense>
      </div>
    </div>
  );
}
