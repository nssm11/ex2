/**
 * Identité visuelle partagée par tous les e-mails.
 *
 * Les valeurs sont volontairement copiées de `@theme` dans `src/app/globals.css`
 * (ivoire chaud, encre, champagne) pour que le courriel soit le prolongement
 * naturel du site. Les polices du site (Newsreader / Manrope) ne sont pas
 * chargées : aucun client de messagerie ne les installe, on retombe donc sur
 * des piles de secours équivalentes — serif pour le display, sans-serif pour
 * le corps de texte.
 */

export const BRAND = {
  /** Nom court, tel qu'il apparaît dans l'en-tête du site. */
  name: "Cléopâtre",
  /** Signature sous le nom. */
  tagline: "Espace Santé Beauté",
  /** Raison sociale complète, utilisée dans le pied de page. */
  legalName: "Cléopâtre — Espace Santé Beauté",
  phone: "71 450 210",
  phoneHref: "+21671450210",
  city: "Tunis, Tunisie",
} as const;

export const C = {
  paper: "#f2ecdf", // fond ivoire — celui du site
  cream: "#faf6ec", // fond des cartes
  ivory: "#f6f1e6",
  stone: "#e0d7c3", // filets
  stone2: "#c6bba1",
  ink: "#211b12", // encre chaude
  charcoal: "#38322a",
  muted: "#6d6253",
  muted2: "#988b72",
  champagne: "#a3803f",
  champagne2: "#87662e",
  champagne3: "#cbb078",
  success: "#54704a",
  error: "#96412f",
  white: "#ffffff",
} as const;

export const FONT = {
  /** Empilement serif — remplace Newsreader Variable. */
  display: `Georgia, "Times New Roman", "Iowan Old Style", serif`,
  /** Empilement sans-serif — remplace Manrope Variable. */
  body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
} as const;

/** Largeur utile du courriel. Au-delà, Outlook tronque. */
export const WIDTH = 600;

/**
 * Rend un chemin d'image du site (`/images/products/…`) absolu.
 * Les balises `<img>` d'un courriel ont besoin d'une URL complète : le client
 * de messagerie ne sait pas de quel site provient un chemin relatif.
 */
export function absoluteUrl(path: string | null | undefined, siteUrl: string): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
