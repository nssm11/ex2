import { C, FONT } from "./brand";

/**
 * Petit outillage de génération HTML pour les courriels.
 *
 * Pourquoi ne pas utiliser `react-dom/server` : Next.js interdit cet import
 * dans le graphe App Router (Turbopack le refuse à la compilation). Pourquoi
 * ne pas utiliser `next/image` : il émet `srcset` / `sizes` et s'appuie sur un
 * loader qu'aucun client de messagerie ne sait interpréter.
 *
 * On compose donc le HTML directement, avec des helpers minuscules. C'est aussi
 * ce que produisent les bibliothèques spécialisées avant envoi — l'avantage
 * ici est de garder la main sur chaque attribut.
 */

/** Propriétés CSS qui ne prennent pas d'unité. */
const UNITLESS = new Set([
  "opacity",
  "zIndex",
  "fontWeight",
  "lineHeight",
  "flex",
  "flexGrow",
  "flexShrink",
  "order",
  "zoom",
]);

/** `camelCase` → `kebab-case`, et ajoute `px` aux nombres qui en ont besoin. */
export function css(style: Record<string, string | number | false | null | undefined>): string {
  return Object.entries(style)
    .filter(([, v]) => v !== null && v !== undefined && v !== false && v !== "")
    .map(([k, v]) => {
      const prop = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      const value = typeof v === "number" && !UNITLESS.has(k) ? `${v}px` : String(v);
      return `${prop}:${value}`;
    })
    .join(";");
}

/** Échappe le texte et les valeurs d'attributs. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Concatène en ignorant les morceaux vides (`null`, `false`, `""`). */
export function join(parts: (string | null | false | undefined)[], separator = ""): string {
  return parts.filter((p): p is string => Boolean(p)).join(separator);
}

/* ── Éléments courants ────────────────────────────────────────── */

export function table(children: string, style: Record<string, string | number | false | null | undefined> = {}, attrs: Record<string, string | number> = {}): string {
  const a = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${a} style="${css({ borderCollapse: "collapse", ...style })}">${children}</table>`;
}

export function td(content: string, style: Record<string, string | number | false | null | undefined> = {}, attrs: Record<string, string | number> = {}): string {
  const a = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join("");
  return `<td${a} style="${css(style)}">${content}</td>`;
}

export function tr(content: string, style: Record<string, string | number | false | null | undefined> = {}): string {
  return `<tr${style && Object.keys(style).length ? ` style="${css(style)}"` : ""}>${content}</tr>`;
}

export function p(text: string, style: Record<string, string | number | false | null | undefined> = {}): string {
  return `<p style="${css({ margin: "0 0 14px", fontFamily: FONT.body, fontSize: 15, lineHeight: 1.65, color: C.ink, ...style })}">${text}</p>`;
}

export function link(href: string, text: string, style: Record<string, string | number | false | null | undefined> = {}): string {
  return `<a href="${esc(href)}" style="${css({ color: C.champagne2, textDecoration: "underline", ...style })}">${text}</a>`;
}

export function img(src: string, size: number, alt = ""): string {
  return `<img src="${esc(src)}" width="${size}" height="${size}" alt="${esc(alt)}" style="${css({
    display: "block",
    width: size,
    height: size,
    objectFit: "cover",
    border: `1px solid ${C.stone}`,
    borderRadius: 2,
  })}" />`;
}

/** Saute une ligne sans marge parasite (Outlook ignore `margin` sur les div). */
export function spacer(height: number): string {
  return `<div style="${css({ height: height, lineHeight: `${height}px`, fontSize: 0 })}">&nbsp;</div>`;
}

/**
 * Formate une date en français, sans jamais lever.
 * `Intl.format` lève `RangeError` sur une date invalide : un reçu ne doit pas
 * échouer pour une date absente ou corrompue, on affiche alors un tiret.
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  formatter: Intl.DateTimeFormat,
): string {
  const d = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return "—";
  return formatter.format(d);
}
