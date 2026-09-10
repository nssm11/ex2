import { SITE_URL } from "@/lib/env";
import { formatDT } from "@/lib/money";
import { BRAND, C, FONT, absoluteUrl } from "../brand";
import { css, esc, p, table, td, tr } from "../html";
import { button, divider, emailDocument, eyebrow, h1, muted, productLine, spacer } from "../layout";

export type AbandonedCartLine = {
  slug: string;
  name: string;
  brandName: string | null;
  image: string | null;
  quantity: number;
  /** Prix unitaire relu depuis la base au moment de l'envoi. */
  unitPriceMillimes: number;
  lineTotalMillimes: number;
};

export type AbandonedCartEmailInput = {
  firstName: string | null;
  lines: AbandonedCartLine[];
  subtotal: number;
};

export function abandonedCartSubject(): string {
  return "Votre panier vous attend";
}

/**
 * Relance de panier abandonné.
 *
 * Le contenu est reconstruit côté serveur depuis les prix en base : le
 * courriel ne peut donc pas annoncer un tarif périmé, même si le panier est
 * resté ouvert plusieurs heures.
 */
export function renderAbandonedCartEmail({ firstName, lines, subtotal }: AbandonedCartEmailInput): string {
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const greeting = firstName ? `Bonjour ${esc(firstName)},` : "Bonjour,";
  const plural = count > 1 ? "s" : "";

  const items = lines
    .map((l) =>
      table(
        tr(
          td(
            productLine({
              href: `${SITE_URL}/produit/${l.slug}`,
              imageUrl: absoluteUrl(l.image, SITE_URL),
              brandName: l.brandName,
              name: l.name,
              quantity: l.quantity,
              unitPrice: formatDT(l.unitPriceMillimes),
              lineTotal: formatDT(l.lineTotalMillimes),
              size: 64,
            }),
            { padding: "14px 16px" },
          ),
        ),
        { backgroundColor: C.cream, border: `1px solid ${C.stone}`, borderRadius: 3, marginBottom: 10 },
        { width: "100%" },
      ),
    )
    .join("");

  const total = table(
    tr(
      td(
        "Total de votre panier",
        { padding: "12px 0 0", fontFamily: FONT.body, fontSize: 14, fontWeight: 600, color: C.ink, textAlign: "left" },
        { align: "left" },
      ) +
        td(
          esc(formatDT(subtotal)),
          {
            padding: "12px 0 0",
            fontFamily: FONT.body,
            fontSize: 18,
            fontWeight: 700,
            color: C.ink,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            textAlign: "right",
          },
          { align: "right" },
        ),
    ),
    { marginTop: 8 },
    { width: "100%" },
  );

  return emailDocument({
    title: abandonedCartSubject(),
    preview: `${count} article${plural} vous attend${count > 1 ? "ent" : ""} dans votre panier — ${formatDT(subtotal)}.`,
    unsubscribeNote: `Vous recevez cette relance parce que votre panier ${BRAND.name} contient encore des articles. Passer commande ou vider le panier met fin à ces envois.`,
    body: [
      eyebrow("Votre sélection"),
      h1("Votre panier vous attend"),
      p(
        `${greeting}<br />vous avez laissé ${count} article${plural} dans votre panier. Nous vous les gardons — il vous suffit de confirmer pour finaliser votre commande.`,
      ),
      spacer(6),
      items,
      total,
      spacer(24),
      button(`${SITE_URL}/panier`, "Retourner au panier", "center"),
      spacer(24),
      muted(`Livraison offerte dès 99,000 DT et paiement à la livraison partout en Tunisie. Une hésitation sur un soin ? Nos pharmaciens vous conseillent au ${esc(BRAND.phone)}.`),
      divider(0),
    ].join(""),
  });
}

export function abandonedCartText({ firstName, lines, subtotal }: AbandonedCartEmailInput): string {
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const out: string[] = [
    "Votre panier vous attend",
    "",
    firstName ? `Bonjour ${firstName},` : "Bonjour,",
    "",
    `Vous avez laissé ${count} article${count > 1 ? "s" : ""} dans votre panier. Nous vous les gardons.`,
    "",
  ];
  for (const l of lines) {
    out.push(`  • ${l.name} — ${l.quantity} × ${formatDT(l.unitPriceMillimes)} = ${formatDT(l.lineTotalMillimes)}`);
  }
  out.push("", `Total du panier : ${formatDT(subtotal)}`, "", `Retourner au panier : ${SITE_URL}/panier`, "", `${BRAND.legalName} · ${BRAND.city} · ${BRAND.phone}`);
  return out.join("\n");
}
