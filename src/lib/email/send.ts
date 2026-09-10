import "server-only";
import { EMAIL_FROM, EMAIL_REPLY_TO, isEmailConfigured, resendClient } from "./resend";
import { log } from "@/lib/logger";

/**
 * Envoi réel via l'API Resend.
 *
 * Cette fonction **ne lève jamais** : un e-mail est une action secondaire. Si
 * Resend est injoignable, mal configuré ou refuse le message, on journalise
 * côté serveur et on renvoie un échec — l'appelant (création de compte, de
 * commande, de ticket) doit pouvoir poursuivre normalement.
 */

export type EmailTag = { name: string; value: string };

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tags?: EmailTag[];
};

export type SendEmailResult = { ok: true; id: string | null } | { ok: false; reason: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const to = input.to.trim().toLowerCase();

  if (!EMAIL_RE.test(to)) {
    log.warn("email.skipped", { reason: "invalid_recipient" });
    return { ok: false, reason: "invalid_recipient" };
  }

  if (!isEmailConfigured()) {
    // Pas de clé API : on ne fait pas échouer l'opération métier pour autant.
    log.warn("email.skipped", { reason: "not_configured", to, subject: input.subject });
    return { ok: false, reason: "not_configured" };
  }

  try {
    const resend = resendClient();
    if (!resend) return { ok: false, reason: "not_configured" };

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...((input.replyTo ?? EMAIL_REPLY_TO) ? { replyTo: input.replyTo ?? EMAIL_REPLY_TO } : {}),
      ...(input.tags?.length ? { tags: input.tags } : {}),
    });

    if (error) {
      // `error` peut contenir la réponse d'API ; on ne journalise que le
      // message et le code, jamais l'enveloppe de requête (qui porterait
      // l'en-tête d'autorisation).
      log.error("email.failed", { to, subject: input.subject, reason: error.message, name: error.name });
      return { ok: false, reason: error.message || "resend_error" };
    }

    log.info("email.sent", { to, subject: input.subject, id: data?.id ?? null });
    return { ok: true, id: data?.id ?? null };
  } catch (e) {
    log.error("email.error", { to, subject: input.subject, reason: e instanceof Error ? e.message : "unknown" });
    return { ok: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}
