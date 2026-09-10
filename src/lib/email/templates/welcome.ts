import { SITE_URL } from "@/lib/env";
import { BRAND, C, FONT } from "../brand";
import { css, esc, link, p } from "../html";
import { button, buttonOutline, divider, emailDocument, eyebrow, h1, muted, spacer } from "../layout";

export type WelcomeEmailInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

export function welcomeSubject(): string {
  return `Bienvenue chez ${BRAND.name}`;
}

export function renderWelcomeEmail(input: WelcomeEmailInput): string {
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
  const greeting = fullName ? `Bonjour ${esc(fullName)},` : "Bonjour,";

  return emailDocument({
    title: welcomeSubject(),
    preview: `Votre compte ${BRAND.name} est créé. Bienvenue parmi nous.`,
    unsubscribeNote: `Vous recevez cet e-mail car un compte a été créé avec l’adresse ${input.email}.`,
    body: [
      eyebrow("Votre compte"),
      h1(`Bienvenue chez ${BRAND.name}`),
      p(greeting),
      p(
        `Nous sommes heureux de vous compter parmi nous. Votre compte <strong>${esc(BRAND.name)} — ${esc(
          BRAND.tagline,
        )}</strong> est désormais actif : l’adresse <strong>${esc(input.email)}</strong> est confirmée comme votre identifiant de connexion.`,
      ),
      `<div style="${css({ margin: "22px 0", padding: "16px 18px", backgroundColor: C.ivory, borderLeft: `2px solid ${C.champagne}`, borderRadius: 2 })}">
         <p style="${css({ margin: 0, fontFamily: FONT.body, fontSize: 14, lineHeight: 1.6, color: C.charcoal })}">
           Votre compte vous permet de retrouver vos commandes, de suivre une livraison en cours, d’enregistrer vos adresses et de conserver vos articles favoris.
         </p>
       </div>`,
      p(
        `Nos pharmaciens sélectionnent chaque référence pour son exigence et son efficacité. En cas de question sur un soin ou une commande, notre équipe reste joignable au ${esc(
          BRAND.phone,
        )}.`,
      ),
      spacer(26),
      button(`${SITE_URL}/boutique`, "Découvrir la boutique"),
      divider(26),
      muted(
        `Besoin d’aide ? Notre service client répond sous 24 h ouvrées — il suffit de nous écrire depuis la rubrique ${link(
          `${SITE_URL}/aide`,
          "Aide",
        )} de votre espace.`,
      ),
      spacer(8),
      buttonOutline(`${SITE_URL}/compte`, "Accéder à mon compte"),
    ].join(""),
  });
}

export function welcomeText(input: WelcomeEmailInput): string {
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(" ").trim();
  return [
    `Bienvenue chez ${BRAND.name}`,
    "",
    fullName ? `Bonjour ${fullName},` : "Bonjour,",
    "",
    `Votre compte ${BRAND.name} — ${BRAND.tagline} est désormais actif.`,
    `Votre identifiant de connexion : ${input.email}`,
    "",
    `Compte créé le ${dateFmt.format(new Date())}.`,
    "",
    "Votre compte vous permet de retrouver vos commandes, de suivre une livraison en cours, d’enregistrer vos adresses et de conserver vos articles favoris.",
    "",
    `Découvrir la boutique : ${SITE_URL}/boutique`,
    `Accéder à mon compte : ${SITE_URL}/compte`,
    "",
    `${BRAND.legalName} · ${BRAND.city} · ${BRAND.phone}`,
  ].join("\n");
}
