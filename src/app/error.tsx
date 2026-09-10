"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon, WarningIcon } from "@/components/icons";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-vert px-6 text-cream">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-pill border border-sage-3/50 text-sage-3"><WarningIcon size={24} /></span>
        <p className="eyebrow mt-9 text-sage-3">Un imprévu est survenu</p>
        <h1 className="mt-4 font-display text-display-md">La boutique reste <em>ouverte</em></h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-cream/65">
          Une erreur technique s&apos;est produite sur cette page. Vos données et votre panier sont en sécurité — vous pouvez réessayer, ou reprendre votre parcours.
        </p>
        {error.digest && <p className="mt-6 text-micro tracking-[0.08em] text-cream/35">Référence {error.digest}</p>}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="btn-light">Réessayer</button>
          <Link href="/" className="inline-flex min-h-[52px] items-center gap-2 border border-paper/40 px-8 text-micro font-semibold tracking-[0.08em] text-cream transition-colors hover:border-paper hover:bg-paper hover:text-noir">Accueil <ArrowRightIcon size={13} /></Link>
        </div>
      </motion.div>
    </div>
  );
}
