"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, CheckIcon, SparkIcon, LeafIcon, SearchIcon, ChatIcon } from "@/components/icons";
import { formatDT } from "@/lib/money";
import { EASE_LUXE } from "@/lib/motion";

type Step = 1 | 2 | 3 | 4;
type Answers = {
  skinType: string;
  concerns: string[];
  texture: string;
  sensitivity: string;
};

const STEPS: { n: Step; t: string; d: string }[] = [
  { n: 1, t: "Votre peau", d: "Typologie de base" },
  { n: 2, t: "Vos besoins", d: "Préoccupations ciblées" },
  { n: 3, t: "Vos préférences", d: "Textures & tolérance" },
  { n: 4, t: "Votre routine", d: "Prescription" },
];

const SKIN_TYPES = [
  { id: "mixte", label: "Mixte", desc: "Zone T brillante, joues normales", icon: "◐" },
  { id: "seche", label: "Sèche", desc: "Tiraillements, manque de confort", icon: "○" },
  { id: "grasse", label: "Grasse", desc: "Brillance, pores visibles", icon: "●" },
  { id: "sensible", label: "Sensible", desc: "Réactive, rougeurs faciles", icon: "◎" },
  { id: "normale", label: "Normale", desc: "Équilibrée, peu de besoins", icon: "◑" },
];

const CONCERNS = [
  { id: "hydratation", label: "Déshydratation", sub: "Manque d'eau, teint terne" },
  { id: "imperfections", label: "Imperfections", sub: "Boutons, pores dilatés" },
  { id: "taches", label: "Taches & unifiant", sub: "Hyperpigmentation" },
  { id: "rougeurs", label: "Rougeurs", sub: "Sensibilité, réactivité" },
  { id: "rides", label: "Rides & fermeté", sub: "Lissage, anti-âge" },
  { id: "sensibilite", label: "Peau très sensible", sub: "Tolérance minimale" },
];

const TEXTURES = [
  { id: "legere", label: "Légère & fluide", desc: "Gel, fluide, matifiant" },
  { id: "onctueuse", label: "Onctueuse & nourrissante", desc: "Crème, baume, cocon" },
  { id: "sans-parfum", label: "Sans parfum", desc: "Tolérance maximale" },
  { id: "solaire-quotidien", label: "Avec solaire quotidien", desc: "Protection intégrée" },
];

export function RoutineBuilder() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Answers>({
    skinType: "",
    concerns: [],
    texture: "",
    sensitivity: "moderee",
  });
  const [done, setDone] = useState(false);

  const toggleConcern = (id: string) =>
    setAnswers((a) => ({
      ...a,
      concerns: a.concerns.includes(id) ? a.concerns.filter((x) => x !== id) : [...a.concerns, id].slice(0, 3),
    }));

  const canNext =
    (step === 1 && !!answers.skinType) ||
    (step === 2 && answers.concerns.length > 0) ||
    (step === 3 && !!answers.texture) ||
    step === 4;

  const next = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
    else setDone(true);
  };
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  // Mock routine based on answers — in production this would call an API with scoring
  const mockRoutine = [
    {
      role: "Nettoyer",
      name: "La Roche-Posay Toleriane Dermo-Nettoyant",
      vol: "400 ml",
      price: 28900,
      why: `Pour peau ${answers.skinType || "sensible"} — sans rinçage, apaisant.`,
      image: "/images/products/la-roche-posay-toleriane-dermo-nettoyant-400ml.jpg",
    },
    {
      role: "Traiter",
      name: answers.concerns.includes("taches") ? "La Roche-Posay Pure Vitamin C10 Sérum" : "Avène Hydrance Aqua-Gel",
      vol: "30 ml",
      price: answers.concerns.includes("taches") ? 89000 : 46500,
      why: answers.concerns.includes("taches") ? "Éclat & taches — vitamine C pure" : "Hydratation intense, texture aqua-gel",
      image: answers.concerns.includes("taches")
        ? "/images/products/la-roche-posay-pure-vitamin-c10-serum-30ml.jpg"
        : "/images/products/avene-hydrance-aqua-gel-50ml.jpg",
    },
    {
      role: "Protéger",
      name: "La Roche-Posay Anthelios UVMune 400 SPF50+",
      vol: "50 ml",
      price: 35500,
      why: "Protection très haute, invisible — indispensable.",
      image: "/images/products/la-roche-posay-anthelios-uvmune-400-spf50.jpg",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      {/* Header — progress */}
      <div className="border-b border-line bg-bg-soft/60 px-5 py-5 backdrop-blur sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-copper text-bg">
              <SparkIcon size={16} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-copper">Routine Builder</p>
              <p className="font-display text-[17px] font-[550] leading-none tracking-[-0.01em] text-text">Prescription en 60 secondes</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-text-muted sm:inline-flex">
            Étape {step} / 4 · ~45 s
          </span>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-1.5">
              <div
                className={[
                  "h-1.5 rounded-full transition-colors duration-500",
                  s.n < step || (s.n === step && done) ? "bg-copper" : s.n === step ? "bg-copper/60" : "bg-line",
                ].join(" ")}
              />
              <p className={["text-[11px] font-medium leading-tight", s.n === step ? "text-copper" : "text-text-dim"].join(" ")}>
                <span className="hidden sm:inline">
                  {s.n}. {s.t}
                </span>
                <span className="sm:hidden">{s.n}</span>
              </p>
              <p className="hidden text-[11px] leading-tight text-text-dim sm:block">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="min-h-[420px] px-5 py-6 sm:px-8 sm:py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE_LUXE }}
            >
              <h3 className="font-display text-[22px] font-[550] tracking-[-0.01em] text-text">Quel est votre type de peau ?</h3>
              <p className="mt-2 text-sm text-text-muted">Une seule réponse — on affine ensuite.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {SKIN_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setAnswers((a) => ({ ...a, skinType: t.id }))}
                    className={[
                      "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                      answers.skinType === t.id
                        ? "border-copper bg-copper-soft shadow-[0_4px_16px_rgba(196,164,132,0.18)]"
                        : "border-line bg-bg-soft hover:border-line-strong hover:bg-surface",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium",
                        answers.skinType === t.id ? "border-copper bg-copper text-bg" : "border-line bg-surface text-text-muted",
                      ].join(" ")}
                    >
                      {t.icon}
                    </span>
                    <span>
                      <span className={["block text-sm font-medium", answers.skinType === t.id ? "text-copper" : "text-text"].join(" ")}>{t.label}</span>
                      <span className="text-xs text-text-muted">{t.desc}</span>
                    </span>
                    {answers.skinType === t.id && <CheckIcon size={16} className="ml-auto text-copper" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE_LUXE }}
            >
              <h3 className="font-display text-[22px] font-[550] tracking-[-0.01em] text-text">Vos préoccupations principales ?</h3>
              <p className="mt-2 text-sm text-text-muted">1 à 3 choix — nous priorisons la tolérance.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {CONCERNS.map((c) => {
                  const active = answers.concerns.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleConcern(c.id)}
                      className={[
                        "flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors",
                        active ? "border-copper bg-copper-soft" : "border-line bg-bg-soft hover:border-line-strong",
                      ].join(" ")}
                    >
                      <span>
                        <span className={["block text-sm font-medium", active ? "text-copper" : "text-text"].join(" ")}>{c.label}</span>
                        <span className="text-xs text-text-muted">{c.sub}</span>
                      </span>
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-full border text-xs",
                          active ? "border-copper bg-copper text-bg" : "border-line bg-surface text-transparent",
                        ].join(" ")}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-text-dim">{answers.concerns.length}/3 sélectionnés</p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE_LUXE }}
            >
              <h3 className="font-display text-[22px] font-[550] tracking-[-0.01em] text-text">Vos préférences ?</h3>
              <p className="mt-2 text-sm text-text-muted">Texture, parfum, solaire — pour que la routine tienne.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {TEXTURES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setAnswers((a) => ({ ...a, texture: t.id }))}
                    className={[
                      "rounded-2xl border px-4 py-4 text-left transition-colors",
                      answers.texture === t.id ? "border-copper bg-copper-soft" : "border-line bg-bg-soft hover:border-line-strong",
                    ].join(" ")}
                  >
                    <span className={["block text-sm font-medium", answers.texture === t.id ? "text-copper" : "text-text"].join(" ")}>{t.label}</span>
                    <span className="text-xs text-text-muted">{t.desc}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-line bg-bg-soft p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">Tolérance</p>
                <div className="mt-2 flex gap-2">
                  {[
                    { id: "tres-sensible", l: "Très sensible" },
                    { id: "moderee", l: "Modérée" },
                    { id: "peu-sensible", l: "Peu sensible" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setAnswers((a) => ({ ...a, sensitivity: s.id }))}
                      className={[
                        "flex-1 rounded-full border px-3 py-2 text-xs font-medium",
                        answers.sensitivity === s.id ? "border-copper bg-copper text-bg" : "border-line bg-surface text-text-muted hover:border-copper/20",
                      ].join(" ")}
                    >
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && !done && (
            <motion.div
              key="s4"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE_LUXE }}
            >
              <h3 className="font-display text-[22px] font-[550] tracking-[-0.01em] text-text">Prêt à révéler votre routine ?</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Peau <strong className="font-medium text-text">{answers.skinType || "—"}</strong> · Préoccupations{" "}
                <strong className="font-medium text-text">{answers.concerns.join(", ") || "—"}</strong> · Texture{" "}
                <strong className="font-medium text-text">{answers.texture || "—"}</strong>
              </p>

              <div className="mt-6 rounded-2xl border border-copper/20 bg-copper-soft p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-copper">
                  <LeafIcon size={14} /> Notre promesse
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  3 produits, pas 7. Une routine courte, cohérente, validée par nos pharmaciens — ajustable en boutique ou par téléphone.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-xl border border-line bg-bg-soft px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-soft text-sage">
                  <ChatIcon size={14} />
                </span>
                <p className="text-sm text-text-muted">
                  Besoin d’un avis humain ? <a href="tel:+21671450210" className="font-medium text-copper hover:underline">71 450 210</a> — pharmacien disponible.
                </p>
              </div>
            </motion.div>
          )}

          {done && (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_LUXE }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage text-white">
                  <CheckIcon size={16} />
                </span>
                <div>
                  <h3 className="font-display text-[22px] font-[550] tracking-[-0.01em] text-text">Votre routine prescrite</h3>
                  <p className="text-sm text-text-muted">3 étapes — matin & soir · ajustable</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {mockRoutine.map((r, i) => (
                  <div key={r.role} className="flex gap-4 rounded-2xl border border-line bg-bg-soft p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-copper/20 bg-copper-soft font-mono text-xs font-bold text-copper">
                      0{i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-copper">{r.role}</p>
                      <p className="mt-1 text-sm font-medium leading-tight text-text">{r.name}</p>
                      <p className="text-xs text-text-muted">{r.vol} · {r.why}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-text">{formatDT(r.price)}</p>
                      <Link href="/boutique" className="mt-1 inline-flex text-xs font-medium text-copper hover:underline">
                        Voir →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-sage/20 bg-sage-soft px-4 py-3 text-sm">
                <span className="font-medium text-sage">Total routine : {formatDT(mockRoutine.reduce((s, r) => s + r.price, 0))}</span>
                <span className="text-xs text-text-muted">Livraison offerte dès 99 DT</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-line bg-bg-soft/50 px-5 py-4 sm:px-8">
        <button
          onClick={back}
          disabled={step === 1 && !done}
          className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-2 disabled:opacity-40"
        >
          Retour
        </button>

        {!done ? (
          <button
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-full bg-copper px-6 py-2.5 text-sm font-semibold text-bg shadow-[0_4px_16px_rgba(196,164,132,0.25)] hover:bg-[#D1B196] disabled:opacity-40"
          >
            {step === 4 ? "Révéler ma routine" : "Continuer"} <ArrowRightIcon size={14} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDone(false);
                setStep(1);
              }}
              className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
            >
              Recommencer
            </button>
            <Link href="/boutique" className="rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-bg hover:bg-white">
              Voir la boutique
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
