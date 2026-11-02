# S.E.C.E – Smart Eye Civil Engineering

Site vitrine bilingue (FR / EN) et back-office du bureau d'études structures et VRD S.E.C.E, Tunis.
Next.js 16 sur Cloudflare Workers, données Firestore, médias Cloudflare R2.

Architecture et décisions : [docs/00-cadrage.md](docs/00-cadrage.md).

## Prérequis

- Node.js 22 ou plus récent (développé avec Node 24), npm 11
- Un compte Cloudflare (Workers, R2) et le projet Firebase `smarteyecivilengineering-578e2`

## Installation

```bash
npm install
cp .env.example .env.local   # puis compléter les valeurs
npm run dev                  # http://localhost:3000
```

> Le dossier du projet est actuellement dans OneDrive : la synchronisation de `node_modules` et `.next` ralentit fortement l'installation et la compilation. Il est conseillé de déplacer le projet hors de OneDrive (par exemple `C:\dev\sece`).

## Scripts

| Commande             | Rôle                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `npm run dev`        | Serveur de développement                                              |
| `npm run build`      | Build Next.js de production                                           |
| `npm run check`      | ESLint + TypeScript + Prettier + tests unitaires                      |
| `npm test`           | Tests unitaires (palette, contrastes WCAG)                            |
| `npm run test:e2e`   | Playwright + axe sur un build de production (`npm run build` avant)   |
| `npm run preview`    | Build Cloudflare et prévisualisation locale dans le runtime Workers   |
| `npm run deploy`     | Build + déploiement manuel du Worker `smarteyecivilengineering`       |
| `npm run upload`     | Build + envoi d'une version sans la publier (URL de prévisualisation) |
| `npm run cf-typegen` | Génère les types des bindings Cloudflare (`cloudflare-env.d.ts`)      |

## Variables d'environnement

Toutes sont décrites dans [.env.example](.env.example). Points importants :

- `NEXT_PUBLIC_*` est figé **au moment du build** : définir ces valeurs avant `npm run deploy`.
- `NEXT_PUBLIC_SITE_ENV=production` rend le site indexable. Toute autre valeur ajoute `noindex` partout et un `robots.txt` qui bloque tout.
- Les secrets de production se déclarent avec `npx wrangler secret put NOM` (jamais dans le dépôt).
- Le jeton `CLOUDFLARE_R2_API_TOKEN` est limité à R2 : il ne permet pas de déployer.

## Déploiement sur Cloudflare (Workers Builds, depuis GitHub)

Chaque push sur `main` est construit et déployé par Cloudflare. Réglages du Worker
(Workers & Pages → `smarteyecivilengineering` → Settings → Build) :

| Réglage                      | Valeur                                                                   |
| ---------------------------- | ------------------------------------------------------------------------ |
| Build command                | `npx opennextjs-cloudflare build`                                        |
| Deploy command               | `npx opennextjs-cloudflare deploy`                                       |
| Non-production branch deploy | `npx opennextjs-cloudflare upload` (URL de prévisualisation par branche) |
| Build variables              | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_ENV`, `NEXT_PUBLIC_FIREBASE_*` |

- Le nom du Worker dans le tableau de bord doit être identique au `name` de `wrangler.jsonc` (`smarteyecivilengineering`).
- Les `NEXT_PUBLIC_*` vont dans les variables **de build** (elles sont figées dans le code compilé), pas dans les variables d'exécution.
- Jusqu'au lancement : `NEXT_PUBLIC_SITE_ENV=preview` (noindex partout). Au lancement : `production`, puis rattacher `smarteyecivilengineering.com` dans Settings → Domains & Routes.
- Le bucket R2 du cache des pages, `sece-site-opennext-cache`, existe déjà.
- **Variables d'exécution** (Settings → Variables and Secrets, type _Secret_) nécessaires à la médiathèque :
  `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_BUCKET`.

## Back-office (`/admin`)

Back-office sur mesure : Firebase Authentication (comptes), Firestore (contenus, rôles), R2 (fichiers).
Guide d'utilisation pour le client : page **Aide** dans l'administration.

### Mise en service (une seule fois)

1. **Règles Firestore** : console Firebase → Firestore Database → Règles → coller [firestore.rules](firestore.rules) → Publier.
   Sans cette étape, toute lecture ou écriture depuis l'admin est refusée.
2. **Domaines autorisés** : console Firebase → Authentication → Paramètres → Domaines autorisés → ajouter
   `smarteyecivilengineering.com` et l'adresse `*.workers.dev` de la préproduction (nécessaire pour le lien de confirmation d'e-mail).
3. **Premier administrateur** : ouvrir `/admin/inscription`, créer le compte avec `smarteyecivilengineering@gmail.com`,
   cliquer sur le lien de confirmation reçu, puis se connecter. Cette adresse devient administrateur automatiquement
   (règle `isBootstrapOwner` de `firestore.rules`).
4. **Données de référence** : sur le tableau de bord, bouton « Importer les données de référence » (services, projets,
   catégories, page À propos, 6 brouillons d'articles). Les contenus existants ne sont jamais écrasés.
5. **Autres personnes** : menu Utilisateurs et rôles → inviter l'adresse avec un rôle, puis lui envoyer le lien `/admin/inscription`.

### Rôles

| Rôle           | Accès                                                       |
| -------------- | ----------------------------------------------------------- |
| Administrateur | Tout, y compris utilisateurs et configuration               |
| Éditeur        | Projets, services, actualités, catégories, À propos, médias |
| Commercial     | Messages et demandes de devis (phase 3)                     |

Les droits sont appliqués par les règles Firestore (côté Google) et vérifiés à nouveau par les routes `/api/admin/*`.

### Fonctionnement

- **Schémas** : chaque type de contenu est décrit une fois dans `src/admin/schemas/` (champs, onglets, aide). L'éditeur, les
  listes, la validation et les indicateurs de traduction en découlent. Ajouter un champ = ajouter une ligne au schéma.
- **Publication** : brouillon / publié. À chaque enregistrement : une version (historique et restauration), une ligne du
  journal d'audit, et l'appel à `/api/admin/revalidate` qui rafraîchit les pages concernées.
- **Brouillon local** : les saisies non enregistrées sont conservées dans le navigateur et proposées à la réouverture.
- **Médias** : envoi par `/api/admin/media` (extension, signature réelle du fichier et poids vérifiés ; SVG refusé), stockage
  R2 sous une clé contenant l'empreinte du fichier, diffusion par `/media/…` avec cache d'un an. Doublons détectés par empreinte.
- **Texte riche** : stocké en JSON (Tiptap), jamais en HTML : le site public le rend avec ses propres composants.

## Structure

```
src/
  app/[locale]/(site)/   pages publiques (dossiers en français, URLs anglaises via i18n/routing.ts)
  app/[locale]/          mise en page racine, 404 localisée, page d'erreur
  components/ui/         boutons, cartes, pastilles, fil d'Ariane, icônes
  components/layout/     en-tête, menu mobile, pied de page, barre d'actions mobile
  components/sections/   sections de pages (ossature SVG du hero…)
  i18n/                  routage FR/EN, navigation typée, chargement des messages
  messages/              textes d'interface FR et EN
  lib/                   données société (site.ts), SEO, polices, utilitaires
  styles/tokens.css      design tokens (palette, typographie, rayons, ombres)
tests/unit               palette et contrastes
tests/e2e                parcours, hreflang, accessibilité (axe)
```

## Règles du projet

- **Palette** : seules les 9 couleurs de `src/styles/tokens.css` existent. Le test `tests/unit/palette.test.ts` échoue si une autre couleur hex, ou une couleur `rgb()/hsl()` brute, apparaît dans `src/`. Les transparences passent par `color-mix()` sur un token.
- **Contenu** : aucune donnée factuelle hors des sources de la brochure et du CV. Une information manquante reste vide sur le site et apparaît comme « À compléter » dans le back-office.
- **Références** : les projets antérieurs à 12/2020 portent toujours l'étiquette « Expérience de notre ingénieur conseil ».
- **Accessibilité** : WCAG 2.2 AA, vérifiée par axe dans Playwright à chaque CI.

## Avancement

- [x] Phase 0 – Cadrage
- [x] Phase 1 – Fondations (tokens, polices, i18n, mise en page, composants, tests, CI, build Cloudflare)
- [x] Phase 2 – Back-office et données (Firestore, Firebase Auth, médias R2, seed) — reste : réception des messages et devis (avec les formulaires, phase 3), publication planifiée, double authentification
- [ ] Phase 3 – Pages publiques
- [ ] Phase 4 – Projets et 3D
- [ ] Phase 5 – Animations
- [ ] Phase 6 – SEO et performance
- [ ] Phase 7 – Recette et livraison
