# Cléopâtre — Modern Apothecary
### Refonte complète · Vision créative & Design System

> **Philosophie inchangée** : *« La beauté se soigne avec justesse. »*  
> **Nouvelle langue visuelle** : *Modern Apothecary* — pharmacie de haute précision × studio de design contemporain.  
> **Date** : 10 septembre 2026 · Branche `arena/01a08ae8-ex2`

---

## 1. Inspection du repository — forces et structure

La codebase actuelle est **exemplaire** : saine, rigoureuse, prête pour la montée en gamme.

| Axe | Constat |
|---|---|
| **Stack** | Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 · Framer Motion · Drizzle ORM + PostgreSQL · Zod + Server Actions |
| **Modèle financier** | Tous les montants en **millimes** (entiers) — pas d’erreur d’arrondi, cohérent front/back/DB |
| **Schéma** | 23 tables Drizzle : users/sessions, brands/categories/concerns/products, reviews, stock movements, promotions, orders, tickets/returns, articles/stores. Relations, index, enums proprement typés |
| **Catalogue** | Recherche, facettes (marques, concerns, prix, stock, promo, rating), tri, pagination, `quickSearch`, produits liés / featured / new / promo, univers enfants, concerns |
| **Navigation** | `getNavigationData()` réorganise 7 univers en 4 méga-groupes (Beauté / Soins / Bien-être / Bébé & Maman) + 4 colonnes desktop + callout + image — IA claire et extensible |
| **Fonts & motion** | `Newsreader` + `Manrope`, scale fluide, `prefers-reduced-motion` respecté, `transform/opacity` only, `EASE_LUXE` (0.22,1,0.36,1) — déjà *quiet luxury* |
| **Shell** | Header sticky + AnnouncementBar + DesktopNavigation (mega-menu) + MobileDrawer + SearchOverlay + CartDrawer (upsell, gift-wrap, free-shipping progress) + Footer statement — complet et accessible |
| **Admin** | Back-office complet : dashboard KPI, commandes, produits/stock, clients, promos, avis, support/retours, journal, boutiques, recherches, audit — séparation rôles `admin`/`support` |
| **Argent & commande** | `formatDT` / `promoMath`, `CL-YYMMDD-XXXX`, clé d’accès page confirmation, `/suivi` par numéro + e-mail, facture PDF |
| **Palette actuelle** | `paper #f2ecdf / stone #e0d7c3 / ink #211b12 / champagne #a3803f` — doux, papier, pierre, champagne. Rayon `xs–lg: 1–4px`, ombres rares, look éditorial *quiet luxury* |

**Forces à conserver** : rigueur métier, précision pharmaceutique, ton éditorial sans sur-promesse, architecture composant claire (`(site)` vs `admin`, `actions`, `lib`, `components/shell|product|catalog|ui`).  
**À élever** : passer d’un luxe papier doux à un **luxe clinique** — plus contrasté, plus tactile, plus moderne, sans perdre la chaleur.

---

## 2. Vision créative — « Modern Apothecary »

Nous abandonnons le *soft paper / stone / champagne* — trop doux, trop clair — pour une **expérience nocturne, précise, intelligente**.

### Moodboard

- **Contemporain & précis, légèrement clinique mais chaud** : comme une pharmacie milanaise rénovée par un studio de design.
- **Plus sombre et plus dramatique** : le fond devient acteur, pas décor. Les produits *flottent* sur la nuit, comme en laboratoire.
- **Haut contraste, raffiné, intelligent** : le texte off-white (#F5F2EB) respire sur charcoal (#121212). Le cuivre n’est plus dorure, il est **dosage**.
- **Sentiment** : confiance d’expert, calme clinique, chaleur tactile. On n’achète pas du « beau », on **se prescrit du juste**.

> *Inspi TikTok* (vt.tiktok.com/ZSqUFhGKj) : produits en lévitation, éclairage doux dramatique, réflexions soyeuses, matériaux mats + verre dépoli, rotations lentes 360°, fond noir profond → nous traduisons cela en **cards en lévitation sur surface  #222**, glow cuivre derrière chaque packshot `object-contain + drop-shadow`, vignette radiale, grille lab subtile.

### Ce qui change dans le ressenti

| Avant (Paper Luxury) | Après (Modern Apothecary) |
|---|---|
| Lumière diffuse, papier, pierre | Nuit chaude, verre, chrome satiné + reflet cuivre |
| Angles à 1–4 px, rigueur éditoriale | Rayon 8–16 px, douceur clinique, pilules et flacons |
| Accent champagne doré dominant | Cuivre **fonctionnel** (#C4A484) + sauge ultra-restreinte (#8A9A8B) comme validation |
| Sections ivoire `paper/cream` alternées | Deux teintes seules : `#121212` / `#1A1A1A` + surfaces élevées `#222`/`#2A2A2A` |
| Grands titres fins, hairlines | Mêmes titres mais **Fraunces** italique dramatique + sans géométrique net — hiérarchie plus médicale |

---

## 3. Design System complet — Modern Apothecary

### 3.1 Couleurs

```css
/* Grounds */
--color-bg:        #121212  /* fond primaire — charcoal profond */
--color-bg-soft:   #1A1A1A  /* alternance, header glass */
--color-bg-muted:  #1E1E1E
--color-surface:   #222222  /* carte / field */
--color-surface-2: #2A2A2A  /* hover / élevé */
--color-surface-3: #303030

/* Texte */
--color-text:       #F5F2EB /* primary — off-white chaud */
--color-text-muted: #A89F94 /* secondary */
--color-text-dim:   #7E786F

/* Accents */
--color-copper:       #C4A484 /* cuivre doux — CTA, prix, liens */
--color-copper-deep:  #B08D6A
--color-copper-soft:  rgba(196,164,132,0.12)
--color-sage:         #8A9A8B /* validation, stock, succès — très retsraint */
--color-sage-soft:    rgba(138,154,139,0.14)

/* Lignes — gris chaud très subtil */
--color-line:        rgba(245,242,235,0.07)
--color-line-strong: rgba(245,242,235,0.11)

/* Sémantique (désaturée, jamais criarde) */
--color-success-soft: rgba(138,154,139,0.14)
--color-error: #C07D6B
```

**Mapping legacy** (pour compat rétro) : `paper→bg`, `cream→surface`, `stone→line`, `ink/charcoal→text`, `champagne→copper`, `noir→#0B0B0B`.

### 3.2 Typographie

| Usage | Famille | Poids | Notes |
|---|---|---|---|
| **Display** | `Fraunces Variable` (SOFT 50–100, WONK 1, opsz 9–144) | 320–600, italique 320–500 | Titres dramatiques, italic cuivre pour le twist. Fallback `Newsreader` |
| **Body / UI** | `Instrument Sans Variable` + `Inter Tight Variable` (géométrique, lisible) | 400–700 | Navigation, labels, prix. Fallback `Manrope` |
| **Mono** | `ui-monospace` | — | Codes promo, SKU |

Échelle fluide :

```css
--text-display-xl: clamp(2.75rem,7vw,5.75rem)  / 0.92 / -0.032em
--text-display-lg: clamp(2.2rem,4.8vw,3.75rem)  / 0.96 / -0.025em
--text-display-md: clamp(1.65rem,3vw,2.35rem)
--text-eyebrow: 0.6875rem / 0.2em / caps 600
```

Hiérarchie : **grande, respirante, très contrastée** — 52–58px de leading serré sur display, 15–17px / 1.7 sur body.

### 3.3 Espacement / Layout

```
--spacing-section: 6.5rem  (au lieu de 8.5)
--spacing-section-sm: 4rem
--spacing-gutter: 1.25rem
--spacing-gutter-lg: clamp(1.5rem,4vw,3rem)
container-lux: max 88rem + gutter
container-narrow: 46rem
```

Whitespace : toujours généreux, mais **plus dense** — cards groupées en grille, pas en colonnes éditoriales infinies.

### 3.4 Rayons & Ombres — soft depth

```css
--radius-xs:  8px
--radius-sm: 10px
--radius-md: 14px
--radius-lg: 16px  /* card standard */
--radius-xl: 20px
--radius-2xl:24px  /* hero frame */
--radius-pill:999px /* CTA, search, badges, stepper */

--shadow-card:  0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.32)
--shadow-card-hover: 0 4px 0 rgba(255,255,255,0.03), 0 16px 40px rgba(0,0,0,0.45)
--shadow-float: 0 24px 64px rgba(0,0,0,0.55)
--shadow-glass: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)
```

### 3.5 Motion

Conservé et précisé : `EASE_LUXE (0.22,1,0.36,1)` pour entrées hero / carte, `EASE_CALM (0.4,0,0.2,1)` pour hovers, `EASE_SPRING` pour badges. Durées **280 / 600 / 1000 ms**. Seuls `transform + opacity`.

### 3.6 Composants — principes

- **Surfaces** : `surface` (#222 + line + 16px) → `surface-2` au hover. Jamais de `bg-paper` plat sans border.
- **Glass** : `glass` (rgba 34,34,34 0.72 / blur 16px / border 1px rgba(245,242,235,0.08) + inner highlight) pour cartes flottantes hero, search, panier.
- **Boutons** : `btn-primary` = pilule cuivre #C4A484 → #D1B196 + lift + outer glow ; `btn-secondary` = transparent + border line + pill ; `btn-ghost` = underline cuivre animé ; `btn-light` = off-white pilule.
- **Champs** : 48px, surface + line-strong + 14px, focus `copper 3px 0.14`, placeholder `#7E786F`.
- **Badges** : pilules 10px/0.12em, `copper-soft` / `sage-soft` / `surface`.
- **Cards produit** : `p-2` + image `aspect-square rounded-[12px] bg-bg-soft` + glow cuivre radial + `object-contain p-6 drop-shadow` (pas cover), wishlist verre, quick-add pilule blanche.

---

## 4. Direction 3D — adaptation au sombre

Le TikTok de référence conserve sa cinématique, mais son **théâtre change** :

- **Fond** : plus jamais papier. `bg-bg (#121212)` + grille lab `linear-gradient rgba(245,242,235,0.015) 1px` + halos `radial-gradient copper 0.18 @ 50% 42%`.
- **Éclairage** : *soft dramatic* — key light douce 45°, rim cuivre très léger, ombre portée `0 16px 32px rgba(0,0,0,0.45)` + reflet satiné sur verre. Produits en `object-contain` avec padding généreux → on voit le flacon, pas un crop marketing.
- **Matériaux** : verre dépoli + aluminium brossé + carton mat chaud — tous rendus mats, jamais brillants. Bord de carte = `inset 0 1px 0 rgba(255,255,255,0.06)`.
- **Mouvement** : hover lift `translateY(-3 to -6px)` + scale 1.04–1.05 sur image sur 1200 ms `EASE_LUXE`, pas de rotation brutale (préserve la lecture apothicaire).
- **Recommandation shoot** : packshot sur fond transparent → rendu navigateur avec glow CSS, pas dans l’image ; permet `drop-shadow` cohérent et performance.

---

## 5. Nouvelle structure Homepage — Modern Apothecary

Ordre narratif : **Promesse → Preuve → Prescription → Découverte → Désir → Offre → Éducation → Confiance → Présence**

| # | Section | Rôle | Contenu |
|---|---|---|---|
| 01 | **Hero — Laboratory** | Cinematic entrance, dark | Split 6/6 : `HeroText` (eyebrow lab + Fraunces `La beauté / se soigne / avec justesse.` cuivre italic) + frame 4:5 `hero.jpg` avec vignette + glow + dosage card `Avène Hydrance` + floating glass `Conseil pharmaceutique`. Stats pills 100% / 2 / 24–72h en bas |
| 02 | **Trust Rail** | Authority, clinical | 4 cards glass `surface` rondes : Authenticité (sage), Livraison (copper), Click & Collect, Prix justes — icône pill + 12px caps |
| 03 | **Routine Builder — Flagship** | **Feature phare** | 5/7 split : gauche pitch + CTA `Créer ma routine` + preuves `Sans jargon / Validé pharmacien` ; droite 3 steps `01 Diagnostiquer / 02 Composer / 03 Ajuster` (pills numérotées cuivre) + barre `Stock temps réel par boutique → Voir les stocks` |
| 04 | **Univers — Dark Lab Cards** | Discovery | 3 coul. : 7 cards `h-[280px]` image cover + gradient `to-top 88%` + badge pill + titre 22px blanc + `Explorer →` cuivre — hover lift |
| 05 | **Sélection — 8 Essentiels** | Desire, 3D | `ProductGrid` 4 coul. avec nouvelles cartes tactiles (glow, contain, quick-add pilule) |
| 06 | **Offres — Copper Lab** | Campaign | 4/8 split : gauche codes pills `CODE` cuivre + label, droite 4 produits offre `col-span-2 row-span-2` pour le hero promo — cards `image contain + badge Offre` |
| 07 | **Besoins — Par besoin** | Educational | 4 sticky + 2-col grille `concerns` : cards `border line → copper/20` + flèche pilule |
| 08 | **Marques — Maisons** | Trust | 5/7 split : gauche pills marques + droite 6 cards `story` line-clamp 3 |
| 09 | **Journal — Editorial Lab** | Content | 7/5 : lead `h-16/10 rounded-2 border line` + badge verre + 2 articles latéraux pilule `tag · min` |
| 10 | **Boutiques — Presence** | Human | Image `maison.jpg` + badge map pill + 2 stores `rounded-2 border line p-4` avec tel pilule |

Toutes les sections utilisent `border-b border-line`, alternance `bg` / `bg-soft` (+ halo cuivre/sage subtil en `radial-gradient`), `py-12 / lg:py-16`, `SectionHeading` avec `eyebrow-copper + h-px w-6 copper/60`.

---

## 6. Admin — direction visuelle (cohérente, laboratoire raffiné)

L’admin **reste sombre**, mais passe de `warm noir #17130d` à **lab nocturne #0F0F0F** — même langage que le public, plus outillé.

- **Top bar** : `bg-admin-bg/80 backdrop-blur 16px` + logo pill `gold/10 + border gold/20` + user pill `border admin-border + panel` + CTA `Quitter` pilule off-white.
- **Nav** : container `rounded-2 border admin-border bg-admin-panel p-3` ; items pilules `min-h-10 rounded-full` : idle `text-muted hover:panel-2`, active `bg-gold text-bg shadow copper 0.22` + chevron.
- **Panels / tables** : `rounded-2 border admin-border bg-admin-panel shadow 0 8px 24px` ; header table `bg-panel-2/50` ; KPI `rounded-2 + top hairline gradient gold/40`.
- **Boutons** : `abtn` pilule cuivre, `abtnGhost` pilule border, `abtnDanger` pilule error-soft.
- **Champs** : `afield` 44px rounded-xl `bg-admin-bg + border admin-border → gold 0.15` + ring.
- **État** : même `line`/`copper`/`sage`, jamais de champagne doré flashy — tout est dosé.

L’idée : l’admin **n’est plus un back-office brun**, c’est le **laboratoire** derrière la boutique — propre, sombre, lisible, avec les mêmes 8px–16px et le même verre.

---

## 7. Premiers livrables concrets — implémentés

### 7.1 Global Design Tokens — `src/app/globals.css`

Refonte complète `@theme` : nouveaux grounds, textes, accents, lignes, sémantique, admin, radius 8–24 + pill, shadows dark, typos `Fraunces + Instrument Sans / Inter Tight`, motion, blur, z.  
+ utilitaires : `container-lux/wide/narrow`, `eyebrow-copper`, `surface/elevated/raised`, `glass / glass-strong`, `card-apo`, `field`, `btn-primary/secondary/ghost/light/icon`, `frame/frame-grain/frame-vignette/image-glow`, `skeleton` sombre.

**Dépendances** ajoutées :

```json
"@fontsource-variable/fraunces": "^5.3.0",
"@fontsource-variable/inter-tight": "^5.3.0",
"@fontsource-variable/instrument-sans": "^5.3.0"
```

> Legacy classes (`bg-paper`, `text-ink`, `border-stone`, `text-champagne`…) restent fonctionnelles : elles pointent désormais vers les nouvelles valeurs sombres — migration progressive sans casse.

### 7.2 Hero cinématique — `src/components/shell/hero-text.tsx` + hero section `src/app/(site)/page.tsx`

- `HeroText` : eyebrow lab `· Depuis 2012`, titres `Fraunces` 0.92/ -0.032em avec stagger 0.12s, description 15px muted + trust pills `100% authentique / Paiement à la livraison / Conseil pharmacien`.
- Hero section : grille 12, `bg-grid 3.5% + radial copper/sage`, frame `rounded-[24px] border line shadow-float`, image cover + vignette, dosage card `Avène`, floating `glass-strong` conseil — éclairage dramatique doux, prêt pour la vidéo 3D en `object-contain`.

### 7.3 Philosophie composant — nouveaux principes

| Composant | Philosophie | Fichier |
|---|---|---|
| **Header** | Charcoal glass `#121212/80 blur 16` ; logo pill cuivre ; search pilule `border line bg-surface + ⌘K` ; panier pilule off-white ; nav `border-line + cop underline` ; mega-menu `bg-bg-soft/95 blur 18 + cards rounded-xl border line/60` | `src/components/shell/header.tsx` + `desktop-nav.tsx` + `announcement-bar.tsx` |
| **ProductCard** | Carte lab `rounded-[16] p-2 border line shadow-card` ; image `rounded [12] bg-bg-soft + radial copper + object-contain p-6 drop-shadow` ; badges pilules cuivre / verre ; wishlist verre 9×9 ; quick-add pilule blanche bottom 2.5 ; contenu `brand pill → name 14/500 → prix 15/semibold` | `src/components/catalog/product-card.tsx` |
| **SectionHeading / PageHeader / Badge / QtyStepper / Steps** | Eyebrow cuivre avec hairline, titres `text-text`, badges pilules soft, stepper pilule `bg-soft + bg-text`, steps cuivre pilule | `src/components/ui/primitives.tsx` |
| **Footer** | Statement `bg-soft + eyebrow copper` ; brand card `rounded-2 border line bg-surface shadow-card` + newsletter pilule `border line + bg-bg + CTA off-white` ; boutiques en cards pilules ; legal `border line` | `src/components/shell/footer.tsx` |
| **Admin** | Lab nocturne `bg #0F0F0F`, nav pilules, panels `rounded-2`, KPI hairline gradient | `src/app/admin/layout.tsx` + `components/admin/ui.tsx` + `admin-nav.tsx` |

**Build** : `DATABASE_URL=… SESSION_SECRET=… npm run build` → ✓ Compiled + 11 static pages.

---

### Prochaines étapes (proposées)

1. **Routine Builder interactif** : wizard 4 questions → `localStorage` + pré-remplissage panier + endpoint `POST /api/routine`.
2. **Stock temps réel par store** : `inventoryMovements` + `storeStock` vue + badge `Ezzahra ✓ / Hammam-Lif 2 left` sur chaque card.
3. **Arabic RTL** : `dir="rtl"` + `font-display: "Fraunces"` → remplacement par `Amiri` / `IBM Plex Sans Arabic` + vérif. `logical properties`.
4. **3D packs** : remplacer `hero.jpg` par vidéo `mp4` 6s loop (TikTok style) + `prefers-reduced-motion: image`.

---

**L’essence** : Cléopâtre ne vend plus du soin clair et doux — elle **prescrit la justesse dans une nuit chaude, précise et réfléchie**. Le cuivre dose, la sauge valide, le verre révèle. Le reste est silence.

— *Modern Apothecary, livré.*

