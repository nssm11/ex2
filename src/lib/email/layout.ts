import { SITE_URL } from "@/lib/env";
import { BRAND, C, FONT, WIDTH } from "./brand";
import { css, esc, img, join, link, p, spacer, table, td, tr } from "./html";

/**
 * Gabarit commun à tous les courriels.
 *
 * Contraintes respectées :
 *  • structure en tableaux (Outlook desktop ignore Flexbox) ;
 *  • styles en ligne (Gmail nettoie les blocs `<style>` imbriqués) ;
 *  • aucun JavaScript ;
 *  • une version texte brut est produite à côté de chaque gabarit.
 */

const MEDIA_QUERY = `
@media only screen and (max-width: 620px) {
  .em-shell { width: 100% !important; }
  .em-pad { padding-left: 18px !important; padding-right: 18px !important; }
  .em-stack { display: block !important; width: 100% !important; padding: 0 0 16px !important; }
}`;

/* ── Blocs réutilisables ──────────────────────────────────────── */

/** Bouton plein encre — reprend `.btn-primary` du site. */
export function button(href: string, label: string, align: "left" | "center" = "left"): string {
  return table(
    tr(
      td(
        `<a href="${esc(href)}" style="${css({
          display: "inline-block",
          padding: "14px 30px",
          fontFamily: FONT.body,
          fontSize: 13.5,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: C.paper,
          textDecoration: "none",
          backgroundColor: C.ink,
          borderRadius: 3,
        })}">${esc(label)}</a>`,
        { borderRadius: 3 },
        { align: "center", bgcolor: C.ink },
      ),
    ),
    { margin: align === "center" ? "0 auto" : "0" },
  );
}

/** Bouton contour — reprend `.btn-outline` du site. */
export function buttonOutline(href: string, label: string, align: "left" | "center" = "left"): string {
  return table(
    tr(
      td(
        `<a href="${esc(href)}" style="${css({
          display: "inline-block",
          padding: "13px 28px",
          fontFamily: FONT.body,
          fontSize: 13.5,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: C.ink,
          textDecoration: "none",
          borderRadius: 3,
        })}">${esc(label)}</a>`,
        { borderRadius: 3, border: `1px solid ${C.ink}` },
        { align: "center" },
      ),
    ),
    { margin: align === "center" ? "0 auto" : "0" },
  );
}

/** Filet horizontal avec espace au-dessus et en dessous. */
export function divider(space = 24, color: string = C.stone): string {
  return table(
    tr(td("&nbsp;", { paddingTop: space, paddingBottom: space, borderTop: `1px solid ${color}`, fontSize: 0, lineHeight: 0 })),
    {},
    { width: "100%" },
  );
}

/** Encartré clair (cartes du site : fond crème, filet pierre). */
export function card(content: string, style: Record<string, string | number> = {}): string {
  return table(
    tr(td(content, { padding: "16px 20px" })),
    { backgroundColor: C.ivory, border: `1px solid ${C.stone}`, borderRadius: 3, ...style },
    { width: "100%" },
  );
}

/** Sur-titre discret — équivalent du style `eyebrow` du site. */
export function eyebrow(text: string): string {
  return p(esc(text), {
    margin: "0 0 6px",
    fontFamily: FONT.body,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: C.muted2,
  });
}

export function h1(text: string): string {
  return `<h1 style="${css({
    margin: "0 0 10px",
    fontFamily: FONT.display,
    fontSize: 27,
    lineHeight: 1.25,
    fontWeight: 500,
    color: C.ink,
    letterSpacing: "-0.01em",
  })}">${esc(text)}</h1>`;
}

export function h2(text: string): string {
  return `<h2 style="${css({ margin: "0 0 12px", fontFamily: FONT.display, fontSize: 19, lineHeight: 1.3, fontWeight: 500, color: C.ink })}">${esc(text)}</h2>`;
}

export function muted(text: string): string {
  return p(text, { margin: "0 0 10px", fontSize: 13, color: C.muted });
}

/** Ligne d'un tableau d'informations (libellé à gauche, valeur à droite). */
export function infoRow(label: string, value: string, strong = false): string {
  return tr(
    td(esc(label), {
      padding: "7px 0",
      fontFamily: FONT.body,
      fontSize: strong ? 14 : 13,
      color: strong ? C.ink : C.muted,
      fontWeight: strong ? 600 : 400,
    }) +
      td(esc(value), {
        padding: "7px 0",
        fontFamily: FONT.body,
        fontSize: strong ? 16 : 13,
        color: C.ink,
        fontWeight: strong ? 700 : 500,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        textAlign: "right",
      }),
  );
}

export function infoTable(rows: string): string {
  return table(`<tbody>${rows}</tbody>`, {}, { width: "100%" });
}

/** Vignette produit + nom + quantité, partagée par le reçu et la relance. */
export function productLine(opts: {
  href: string;
  imageUrl: string | null;
  brandName?: string | null;
  name: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  size?: number;
}): string {
  const size = opts.size ?? 56;
  const brand = opts.brandName
    ? `<p style="${css({ margin: "0 0 2px", fontFamily: FONT.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", color: C.muted2 })}">${esc(opts.brandName)}</p>`
    : "";
  const thumb = opts.imageUrl
    ? td(`<a href="${esc(opts.href)}">${img(opts.imageUrl, size)}</a>`, { paddingRight: 12, verticalAlign: "middle" }, { width: size + 8 })
    : "";
  return table(
    tr(
      td(
        table(
          tr(
            join([
              thumb,
              td(
                join([
                  brand,
                  `<a href="${esc(opts.href)}" style="${css({
                    fontFamily: FONT.body,
                    fontSize: 14,
                    fontWeight: 500,
                    color: C.ink,
                    textDecoration: "none",
                    lineHeight: 1.4,
                  })}">${esc(opts.name)}</a>`,
                  `<p style="${css({ margin: "3px 0 0", fontFamily: FONT.body, fontSize: 11, color: C.muted2 })}">${esc(
                    `${opts.quantity} × ${opts.unitPrice}`,
                  )}</p>`,
                ]),
                { verticalAlign: "middle" },
              ),
            ]),
          ),
          {},
          { width: "100%" },
        ),
        { padding: "12px 0", borderBottom: `1px solid ${C.stone}`, verticalAlign: "top" },
      ) +
        td(
          esc(opts.lineTotal),
          {
            padding: "12px 0",
            borderBottom: `1px solid ${C.stone}`,
            verticalAlign: "middle",
            fontFamily: FONT.body,
            fontSize: 14,
            fontWeight: 600,
            color: C.ink,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            textAlign: "right",
          },
          { width: 100 },
        ),
    ),
    {},
    { width: "100%" },
  );
}

/* ── En-tête et pied ──────────────────────────────────────────── */

function emailHeader(): string {
  return table(
    tr(
      td(
        join([
          `<span style="${css({ fontFamily: FONT.display, fontSize: 27, fontWeight: 500, letterSpacing: "0.01em", color: C.paper, lineHeight: 1.2 })}">${esc(
            BRAND.name,
          )}</span>`,
          "<br />",
          `<span style="${css({ fontFamily: FONT.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", color: C.champagne3 })}">${esc(
            BRAND.tagline,
          )}</span>`,
        ]),
        { padding: "26px 32px", textAlign: "center" },
      ),
    ),
    { backgroundColor: C.ink },
    { width: "100%" },
  );
}

function emailFooter(unsubscribeNote?: string): string {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  return table(
    tr(
      td(
        join([
          `<span style="${css({ fontFamily: FONT.display, fontSize: 16, color: C.ink })}">${esc(BRAND.name)}</span>`,
          "<br />",
          esc(`${BRAND.tagline} · ${BRAND.city}`),
          "<br />",
          `<a href="tel:${esc(BRAND.phoneHref)}" style="${css({ color: C.muted, textDecoration: "none" })}">${esc(BRAND.phone)}</a>`,
          "<br />",
          link(SITE_URL, esc(host), { color: C.champagne2, textDecoration: "none" }),
          unsubscribeNote ? "<br />" : "",
          unsubscribeNote ? `<span style="${css({ fontSize: 11, color: C.muted2 })}">${esc(unsubscribeNote)}</span>` : "",
        ]),
        { padding: "26px 32px 34px", textAlign: "center", fontFamily: FONT.body, fontSize: 12, lineHeight: 1.7, color: C.muted },
      ),
    ),
    {},
    { width: "100%" },
  );
}

/* ── Document ─────────────────────────────────────────────────── */

/**
 * Enveloppe un contenu dans la structure complète du courriel.
 * Renvoie le HTML final, prêt à être transmis à Resend.
 */
export function emailDocument(opts: {
  title: string;
  /** Texte de pré-visualisation, affiché après l'objet dans la boîte de réception. */
  preview?: string;
  body: string;
  unsubscribeNote?: string;
}): string {
  const preheader = opts.preview
    ? `<div style="${css({ display: "none", fontSize: 1, lineHeight: 1, maxHeight: 0, maxWidth: 0, opacity: 0, overflow: "hidden", color: C.paper })}">${esc(
        opts.preview,
      )}</div>`
    : "";

  const shell = table(
    join([
      tr(td(emailHeader(), { padding: 0 })),
      tr(td(opts.body, { padding: "30px 32px 8px" }, { class: "em-pad" })),
      tr(td(emailFooter(opts.unsubscribeNote), { padding: 0 })),
    ]),
    { width: WIDTH, maxWidth: "100%", backgroundColor: C.paper },
    { width: WIDTH, class: "em-shell" },
  );

  const outer = table(tr(td(shell, { padding: "28px 12px 40px" }, { align: "center" })), { backgroundColor: C.paper }, { width: "100%" });

  return [
    "<!DOCTYPE html>",
    '<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="color-scheme" content="light" />',
    '<meta name="supported-color-schemes" content="light" />',
    `<title>${esc(opts.title)}</title>`,
    "<!--[if mso]>",
    '<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>',
    "<![endif]-->",
    `<style type="text/css">${MEDIA_QUERY}</style>`,
    "</head>",
    `<body style="${css({ margin: 0, padding: 0, backgroundColor: C.paper })}">`,
    preheader,
    outer,
    "</body>",
    "</html>",
  ].join("\n");
}

export { spacer };
