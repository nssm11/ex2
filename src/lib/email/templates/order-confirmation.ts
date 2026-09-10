import type { Order, OrderItem } from "@/db/schema";
import { SITE_URL } from "@/lib/env";
import { formatDT } from "@/lib/money";
import { ORDER_STATUS_LABELS, PAYMENT_LABELS, SHIPPING_LABELS } from "@/lib/order-constants";
import { BRAND, C, FONT, absoluteUrl } from "../brand";
import { css, esc, formatDate, p, table, td, tr } from "../html";
import { button, divider, emailDocument, eyebrow, h1, h2, infoRow, infoTable, muted, productLine, spacer } from "../layout";

export type OrderEmailInput = {
  order: Order & { items: OrderItem[] };
  customerName: string;
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

export function orderConfirmationSubject(order: Pick<Order, "number">): string {
  return `Confirmation de votre commande n° ${order.number}`;
}

/**
 * Reçu de commande.
 *
 * La structure reprend celle de la facture PDF (`src/lib/invoice-pdf.ts`) :
 * même en-tête maison, même bloc client / livraison, même découpe
 * Produit · Qté · Prix unitaire · Total, mêmes lignes de totaux.
 */
export function renderOrderConfirmationEmail({ order, customerName }: OrderEmailInput): string {
  const date = formatDate(order.createdAt, dateFmt);
  const addr = order.shippingAddress;
  const orderUrl = `${SITE_URL}/commande/confirmation/${order.number}${order.accessKey ? `?k=${encodeURIComponent(order.accessKey)}` : ""}`;

  const addressLines = [addr.line1, addr.line2, `${addr.city} — ${addr.governorate}${addr.postalCode ? ` (${addr.postalCode})` : ""}`].filter(Boolean) as string[];

  const summary = infoTable(
    [
      infoRow("Numéro de commande", order.number, true),
      infoRow("Date", date),
      infoRow("Statut", ORDER_STATUS_LABELS[order.status]),
    ].join(""),
  );

  const blocks = table(
    tr(
      td(
        [
          eyebrow("Client"),
          `<p style="${css({ margin: "0 0 3px", fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: FONT.body })}">${esc(addr.fullName)}</p>`,
          `<p style="${css({ margin: "0 0 3px", fontSize: 13, color: C.muted, fontFamily: FONT.body })}">${esc(order.email)}</p>`,
          `<p style="${css({ margin: 0, fontSize: 13, color: C.muted, fontFamily: FONT.body })}">Tél. ${esc(order.phone)}</p>`,
        ].join(""),
        { paddingRight: 10, verticalAlign: "top", fontFamily: FONT.body, width: "50%" },
        { width: "50%", class: "em-stack" },
      ) +
        td(
          [
            eyebrow("Livraison"),
            ...addressLines.map((l) => `<p style="${css({ margin: "0 0 3px", fontSize: 13, color: C.muted, fontFamily: FONT.body })}">${esc(l)}</p>`),
            `<p style="${css({ margin: "6px 0 0", fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: FONT.body })}">${esc(
              SHIPPING_LABELS[order.shippingMethod],
            )}</p>`,
          ].join(""),
          { paddingLeft: 10, verticalAlign: "top", fontFamily: FONT.body, width: "50%" },
          { width: "50%", class: "em-stack" },
        ),
    ),
    {},
    { width: "100%" },
  );

  const items = order.items
    .map((it) =>
      productLine({
        href: `${SITE_URL}/produit/${it.productId}`,
        imageUrl: absoluteUrl(it.image, SITE_URL),
        brandName: it.brandName,
        name: it.name,
        quantity: it.quantity,
        unitPrice: formatDT(it.unitPriceMillimes),
        lineTotal: formatDT(it.lineTotalMillimes),
      }),
    )
    .join("");

  const totals = infoTable(
    [
      infoRow("Sous-total", formatDT(order.subtotalMillimes)),
      order.discountMillimes > 0 ? infoRow(`Remise${order.promoCode ? ` (${order.promoCode})` : ""}`, `− ${formatDT(order.discountMillimes)}`) : "",
      infoRow("Livraison", order.shippingMillimes > 0 ? formatDT(order.shippingMillimes) : "Offerte"),
      order.giftWrapMillimes > 0 ? infoRow("Emballage cadeau", formatDT(order.giftWrapMillimes)) : "",
      `<tr><td colspan="2" style="${css({ paddingTop: 8, borderTop: `1px solid ${C.stone}` })}">&nbsp;</td></tr>`,
      infoRow("Total", formatDT(order.totalMillimes), true),
    ]
      .filter(Boolean)
      .join(""),
  );

  const notes = [
    `Mode de paiement : <strong style="${css({ color: C.charcoal })}">${esc(PAYMENT_LABELS[order.paymentMethod])}</strong>`,
    order.customerNote ? `Votre message : « ${esc(order.customerNote)} »` : "",
    order.giftMessage ? `Mot cadeau : « ${esc(order.giftMessage)} »` : "",
  ]
    .filter(Boolean)
    .join("<br />");

  return emailDocument({
    title: orderConfirmationSubject(order),
    preview: `Commande n° ${order.number} · ${formatDT(order.totalMillimes)} · ${ORDER_STATUS_LABELS[order.status]}.`,
    unsubscribeNote: `Cet e-mail confirme votre commande passée sur ${BRAND.name}. Conservez-le : il fait office de reçu.`,
    body: [
      eyebrow(ORDER_STATUS_LABELS[order.status]),
      h1("Merci pour votre commande"),
      p(
        `${esc(customerName) ? `Bonjour ${esc(customerName)},` : "Bonjour,"}<br />Nous avons bien reçu votre commande et vous en remercions. Elle est enregistrée sous le numéro <strong>${esc(
          order.number,
        )}</strong> et sera préparée par nos équipes dans les plus brefs délais.`,
      ),
      `<div style="${css({ margin: "20px 0 26px", padding: "16px 20px", backgroundColor: C.ivory, border: `1px solid ${C.stone}`, borderRadius: 3 })}">${summary}</div>`,
      blocks,
      divider(26),
      h2("Vos articles"),
      items,
      spacer(14),
      totals,
      spacer(22),
      muted(notes),
      spacer(22),
      button(orderUrl, "Suivre ma commande"),
      divider(22),
      muted(
        `Une question sur cette commande ? Répondez simplement à cet e-mail ou appelez-nous au ${esc(
          BRAND.phone,
        )}. Nos conseillers vous répondent sous 24 h ouvrées.`,
      ),
    ].join(""),
  });
}

export function orderConfirmationText({ order, customerName }: OrderEmailInput): string {
  const date = formatDate(order.createdAt, dateFmt);
  const addr = order.shippingAddress;
  const lines: (string | null)[] = [
    `Confirmation de votre commande n° ${order.number}`,
    "",
    customerName ? `Bonjour ${customerName},` : "Bonjour,",
    "",
    "Nous avons bien reçu votre commande et vous en remercions.",
    `Numéro : ${order.number}`,
    `Date : ${date}`,
    `Statut : ${ORDER_STATUS_LABELS[order.status]}`,
    "",
    "Articles :",
  ];
  for (const it of order.items) {
    lines.push(`  • ${it.name} — ${it.quantity} × ${formatDT(it.unitPriceMillimes)} = ${formatDT(it.lineTotalMillimes)} (réf. ${it.sku})`);
  }
  lines.push(
    "",
    `Sous-total : ${formatDT(order.subtotalMillimes)}`,
    order.discountMillimes > 0 ? `Remise${order.promoCode ? ` (${order.promoCode})` : ""} : − ${formatDT(order.discountMillimes)}` : null,
    `Livraison : ${order.shippingMillimes > 0 ? formatDT(order.shippingMillimes) : "Offerte"}`,
    order.giftWrapMillimes > 0 ? `Emballage cadeau : ${formatDT(order.giftWrapMillimes)}` : null,
    `Total : ${formatDT(order.totalMillimes)}`,
    "",
    `Paiement : ${PAYMENT_LABELS[order.paymentMethod]}`,
    `Livraison : ${SHIPPING_LABELS[order.shippingMethod]} — ${addr.fullName}, ${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city} — ${addr.governorate}`,
    "",
    `Suivre ma commande : ${SITE_URL}/commande/confirmation/${order.number}${order.accessKey ? `?k=${order.accessKey}` : ""}`,
    "",
    `${BRAND.legalName} · ${BRAND.city} · ${BRAND.phone}`,
  );
  return lines.filter((l): l is string => l !== null).join("\n");
}
