import Image from "next/image";
import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

// Modern Apothecary masthead — dark, precise, copper hairline
export function PageIntro({
  kicker,
  index,
  title,
  intro,
  breadcrumbs,
  image,
  imageAlt,
  imagePriority = false,
  right,
  children,
  className,
  tone = "paper",
}: {
  kicker?: string;
  index?: string;
  title: ReactNode;
  intro?: ReactNode;
  breadcrumbs?: { href?: string; label: string }[];
  image?: string | null;
  imageAlt?: string;
  imagePriority?: boolean;
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: "paper" | "cream" | "noir";
}) {
  const isDark = true; // Modern Apothecary is always dark primary
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-line bg-bg",
        isDark && "bg-bg",
        tone === "cream" && "bg-bg-soft",
        tone === "noir" && "bg-bg",
      )}
    >
      {/* subtle lab gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(196,164,132,0.07),transparent_60%)]"
      />
      <div className={cn("container-lux relative", className ?? "py-10 lg:py-14")}>
        {breadcrumbs && (
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbs} light />
          </div>
        )}
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className={cn("max-w-3xl", image || right ? "lg:col-span-7" : "lg:col-span-9")}>
            {(kicker || index) && (
              <p className="eyebrow-copper mb-4 flex items-center gap-2">
                <span className="h-px w-6 bg-copper/60" aria-hidden />
                {index && <span className="font-display text-[13px] italic text-copper">{index}</span>}
                {kicker}
              </p>
            )}
            <h1 className="font-display text-display-lg tracking-[-0.025em] text-text">{title}</h1>
            {intro && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-text-muted">{intro}</p>}
            {right && <div className="mt-7 flex flex-wrap items-center gap-3">{right}</div>}
          </div>
          {image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:col-span-5 lg:aspect-[5/4]">
              <Image
                src={image}
                alt={imageAlt ?? ""}
                fill
                priority={imagePriority}
                sizes="(max-width:1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "linear-gradient(to top, rgba(18,18,18,0.45), transparent 55%)",
                }}
              />
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
