import "server-only";
import { sendEmail, type SendEmailResult } from "./send";
import { renderWelcomeEmail, welcomeSubject, welcomeText, type WelcomeEmailInput } from "./templates/welcome";
import {
  orderConfirmationSubject,
  orderConfirmationText,
  renderOrderConfirmationEmail,
  type OrderEmailInput,
} from "./templates/order-confirmation";
import {
  renderSupportConfirmationEmail,
  supportConfirmationSubject,
  supportConfirmationText,
  type SupportEmailInput,
} from "./templates/support-confirmation";
import {
  abandonedCartSubject,
  abandonedCartText,
  renderAbandonedCartEmail,
  type AbandonedCartEmailInput,
} from "./templates/abandoned-cart";
import { log } from "@/lib/logger";

/**
 * Point d'entrée unique pour tous les envois transactionnels.
 *
 * Chaque fonction isole ses erreurs : elle rend le gabarit, appelle Resend et
 * renvoie un résultat. Aucune ne lève, aucune n'interrompt l'opération métier
 * qui l'a déclenchée.
 */

export type { SendEmailResult };

/** Référence lisible d'un ticket, reconstruite depuis son identifiant. */
export function ticketReference(id: number): string {
  return `DEM-${String(id).padStart(6, "0")}`;
}

/** 1. E-mail de bienvenue, envoyé à la création d'un compte client. */
export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<SendEmailResult> {
  try {
    return await sendEmail({
      to: input.email,
      subject: welcomeSubject(),
      html: renderWelcomeEmail(input),
      text: welcomeText(input),
      tags: [{ name: "category", value: "welcome" }],
    });
  } catch (e) {
    log.error("email.welcome.crashed", { reason: e instanceof Error ? e.message : "unknown" });
    return { ok: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/**
 * 2. Reçu de commande. `items` doit provenir de la base : ce sont les valeurs
 * réellement facturées, pas le panier du navigateur.
 */
export async function sendOrderConfirmationEmail(input: OrderEmailInput): Promise<SendEmailResult> {
  try {
    return await sendEmail({
      to: input.order.email,
      subject: orderConfirmationSubject(input.order),
      html: renderOrderConfirmationEmail(input),
      text: orderConfirmationText(input),
      tags: [
        { name: "category", value: "order_confirmation" },
        { name: "order_number", value: input.order.number },
      ],
    });
  } catch (e) {
    log.error("email.order.crashed", {
      order: input.order.number,
      reason: e instanceof Error ? e.message : "unknown",
    });
    return { ok: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/** 3. Accusé de réception d'une demande au service client. */
export async function sendSupportConfirmationEmail(input: SupportEmailInput): Promise<SendEmailResult> {
  try {
    return await sendEmail({
      to: input.email,
      subject: supportConfirmationSubject(input.reference),
      html: renderSupportConfirmationEmail(input),
      text: supportConfirmationText(input),
      tags: [{ name: "category", value: "support_confirmation" }],
    });
  } catch (e) {
    log.error("email.support.crashed", { reference: input.reference, reason: e instanceof Error ? e.message : "unknown" });
    return { ok: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/** 4. Relance de panier abandonné (clients authentifiés uniquement). */
export async function sendAbandonedCartReminder(input: AbandonedCartEmailInput & { email: string }): Promise<SendEmailResult> {
  try {
    return await sendEmail({
      to: input.email,
      subject: abandonedCartSubject(),
      html: renderAbandonedCartEmail(input),
      text: abandonedCartText(input),
      tags: [{ name: "category", value: "abandoned_cart" }],
    });
  } catch (e) {
    log.error("email.abandoned_cart.crashed", { reason: e instanceof Error ? e.message : "unknown" });
    return { ok: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}
