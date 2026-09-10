"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Galerie produit.
 *
 * Les références ne portent aujourd'hui qu'un seul visuel : la galerie se
 * réduit alors proprement à une seule image, sans fausse planche de
 * vignettes. Dès qu'un produit en porte plusieurs, la colonne de vignettes
 * apparaît — aucune donnée n'est inventée.
 *
 * Le cadre est volontairement sobre : pas d'ombre portée, pas de bordure
 * épaisse. Le produit est le sujet, l'image est la fenêtre.
 */
export function ProductGallery({ images, name, out }: { images: string[]; name: string; out: boolean }) {
  const list = (images.length ? images : []).filter(Boolean);
  const [active, setActive] = useState(0);
  const src = list[active] ?? list[0] ?? null;

  return (
    <div className="lg:sticky lg:top-28">
      <div className="relative aspect-square overflow-hidden bg-paper-2">
        {src && (
          <Image
            key={src}
            src={src}
            alt={`${name} — Cléopâtre`}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 58vw"
            className={cn(
              "object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]",
              out && "opacity-60 saturate-[0.55] hover:scale-100",
            )}
          />
        )}
      </div>

      {list.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label="Autres vues du produit">
          {list.slice(0, 5).map((im, i) => (
            <li key={im + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Voir la vue ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className={cn(
                  "relative block h-16 w-16 overflow-hidden bg-paper-2 transition-all duration-300",
                  i === active ? "ring-1 ring-vert ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={im} alt="" fill sizes="64px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
