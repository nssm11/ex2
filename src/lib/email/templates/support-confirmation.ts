import type { TicketType } from "@/db/schema";
import { SITE_URL } from "@/lib/env";
import { BRAND, C, FONT } from "../brand";
import { css, esc, formatDate, p } from "../html";
import { buttonOutline, divider, emailDocument, eyebrow, h1, infoRow, infoTable, muted, spacer } from "../layout";

export type SupportEmailInput = {
  /** Référence lisible, dérivée de l'identifiant du ticket. */
  reference: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: TicketType;
  orderNumber?: string | null;
  createdAt: Date;
};

/** Libellés français des motifs de demande. */
const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  product_question: "Question sur un produit",
  return_request: "Demande de retour",
  exchange: "Demande d’échange",
  order: "Question sur une commande",
  delivery: "Livraison",
  damaged_product: "Produit endommagé",
  complaint: "Réclamation",
  pharmacist_advice: "Conseil pharmaceutique",
  other: "Autre demande",
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function supportConfirmationSubject(reference: string): string {
  return `Confirmation de votre demande ${reference}`;
}

export function renderSupportConfirmationEmail(input: SupportEmailInput): string {
  const typeLabel = TICKET_TYPE_LABELS[input.type] ?? "Demande";
  const excerpt = input.message.length > 400 ? `${input.message.slice(0, 400).trimEnd()}…` : input.message;

  const summary = infoTable(
    [
      infoRow("Référence", input.reference, true),
      infoRow("Motif", typeLabel),
      infoRow("Objet", input.subject),
      input.orderNumber ? infoRow("Commande concernée", input.orderNumber) : "",
      infoRow("Déposée le", formatDate(input.createdAt, dateFmt)),
    ]
      .filter(Boolean)
      .join(""),
  );

  return emailDocument({
    title: supportConfirmationSubject(input.reference),
    preview: `Nous avons bien reçu votre demande ${input.reference}. Réponse sous 24 h ouvrées.`,
    unsubscribeNote: `Vous recevez cet e-mail car une demande a été envoyée depuis ${BRAND.name} avec l’adresse ${input.email}.`,
    body: [
      eyebrow("Service client"),
      h1("Nous avons bien reçu votre demande"),
      p(
        `Bonjour ${esc(input.name)},<br />Votre message est enregistré et transmis à notre service client. Nous vous répondons sous <strong>24 heures ouvrées</strong>.`,
      ),
      `<div style="${css({ margin: "20px 0 26px", padding: "16px 20px", backgroundColor: C.ivory, border: `1px solid ${C.stone}`, borderRadius: 3 })}">${summary}</div>`,
      p("Votre message", { fontSize: 14, fontWeight: 600, margin: "0 0 6px" }),
      `<div style="${css({
        margin: "0 0 24px",
        padding: "14px 16px",
        backgroundColor: C.paper,
        border: `1px solid ${C.stone}`,
        borderRadius: 3,
        fontFamily: FONT.body,
        fontSize: 14,
        lineHeight: 1.65,
        color: C.charcoal,
        whiteSpace: "pre-wrap",
      })}">${esc(excerpt)}</div>`,
      p(
        `Conservez votre référence <strong>${esc(input.reference)}</strong> : elle nous permet de retrouver votre dossier immédiatement si vous nous rappelez.`,
      ),
      spacer(22),
      buttonOutline(`${SITE_URL}/compte`, "Suivre ma demande"),
      spacer(24),
      muted(`Une urgence ? Appelez-nous au ${esc(BRAND.phone)} — nos conseillers et pharmaciens sont à votre écoute.`),
      divider(0),
    ].join(""),
  });
}

export function supportConfirmationText(input: SupportEmailInput): string {
  return [
    supportConfirmationSubject(input.reference),
    "",
    `Bonjour ${input.name},`,
    "",
    "Votre message est enregistré et transmis à notre service client. Nous vous répondons sous 24 heures ouvrées.",
    "",
    `Référence : ${input.reference}`,
    `Motif : ${TICKET_TYPE_LABELS[input.type] ?? "Demande"}`,
    `Objet : ${input.subject}`,
    input.orderNumber ? `Commande concernée : ${input.orderNumber}` : null,
    `Déposée le : ${formatDate(input.createdAt, dateFmt)}`,
    "",
    "Votre message :",
    input.message,
    "",
    `Suivre ma demande : ${SITE_URL}/compte`,
    "",
    `${BRAND.legalName} · ${BRAND.city} · ${BRAND.phone}`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}
