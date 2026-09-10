import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

/**
 * Client Resend unique, côté serveur.
 *
 * Ce module est marqué `server-only` : l'importer depuis un composant client
 * casse la compilation plutôt que d'embarquer la clé API dans un bundle.
 * La clé est lue depuis `process.env.RESEND_API_KEY`, jamais depuis une
 * variable `NEXT_PUBLIC_*`.
 */

let client: Resend | null = null;

/** Client initialisé, ou `null` si aucune clé n'est configurée. */
export function resendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

/** Vrai uniquement si une clé API est présente. */
export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}

export const EMAIL_FROM: string = env.EMAIL_FROM;
export const EMAIL_REPLY_TO: string | undefined = env.EMAIL_REPLY_TO;
