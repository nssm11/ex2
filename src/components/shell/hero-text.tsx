"use client";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_LUXE } from "@/lib/motion";

/** Modern Apothecary — Hero typography
 *  Clinical warmth, dramatic serif, precise sans, copper accent.
 *  Dark, contemporary, intelligent.
 */
export function HeroText() {
  const reduce = useReducedMotion();
  const base = reduce ? {} : { y: "108%", opacity: 0 };

  return (
    <div>
      {/* Eyebrow — apothecary lab line */}
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE_LUXE, delay: 0.05 }}
        className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted"
      >
        <span className="h-px w-7 bg-copper/80" aria-hidden />
        Espace Santé Beauté · Ezzahra &amp; Hammam-Lif
        <span className="hidden h-1 w-1 rounded-full bg-copper/60 sm:inline-block" aria-hidden />
        <span className="hidden sm:inline">Depuis 2012</span>
      </motion.p>

      {/* Display — Fraunces, high contrast, dramatic */}
      <h1 className="font-display text-display-xl leading-[0.9] tracking-[-0.035em] text-text text-balance">
        {[
          { t: "La beauté", light: true },
          { t: "se soigne", italic: true, copper: true },
          { t: "avec justesse.", italic: true },
        ].map((l, i) => (
          <span key={l.t} className="block overflow-hidden pb-[0.08em]">
            <motion.span
              initial={base}
              animate={reduce ? {} : { y: 0, opacity: 1 }}
              transition={{ duration: 1.1, ease: EASE_LUXE, delay: 0.18 + i * 0.12 }}
              className={[
                "block",
                l.copper ? "text-copper" : "",
                l.italic ? "italic font-[350]" : "font-[520]",
                l.light ? "font-[420]" : "",
              ].join(" ")}
              style={{ willChange: "transform, opacity" }}
            >
              {l.t}
            </motion.span>
          </span>
        ))}
      </h1>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE_LUXE, delay: 0.72 }}
        className="mt-7 max-w-[34rem] text-[15px] leading-[1.7] text-text-muted"
      >
        Dermo-cosmétique, solaire, cheveux et compléments — une sélection resserrée de{" "}
        <em className="not-italic text-text">produits authentiques et utiles</em>, conseillée
        par nos pharmaciens et livrée partout en Tunisie.
      </motion.p>

      {/* Trust micro — clinical proof */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE_LUXE, delay: 0.9 }}
        className="mt-7 flex flex-wrap items-center gap-3 text-[11px] font-medium tracking-[0.06em] text-text-dim"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden />
          100% authentique
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 backdrop-blur">
          Paiement à la livraison
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-copper-soft px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-hidden />
          Conseil pharmacien
        </span>
      </motion.div>
    </div>
  );
}

/** Compact variant for interior pages */
export function HeroTextCompact({
  eyebrow,
  title,
  accent,
  description,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div>
      {eyebrow && (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_LUXE }}
          className="eyebrow-copper mb-4 flex items-center gap-2"
        >
          <span className="h-px w-6 bg-copper/70" aria-hidden />
          {eyebrow}
        </motion.p>
      )}
      <h1 className="font-display text-display-lg leading-[0.95] tracking-[-0.03em] text-text">
        {title}{" "}
        {accent && <span className="italic font-[380] text-copper">{accent}</span>}
      </h1>
      {description && (
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
