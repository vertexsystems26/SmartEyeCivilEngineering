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
| `npm run deploy`     | Build + déploiement manuel du Worker `sece-site`                      |
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
(Workers & Pages → `sece-site` → Settings → Build) :

| Réglage                      | Valeur                                                                   |
| ---------------------------- | ------------------------------------------------------------------------ |
| Build command                | `npx opennextjs-cloudflare build`                                        |
| Deploy command               | `npx opennextjs-cloudflare deploy`                                       |
| Non-production branch deploy | `npx opennextjs-cloudflare upload` (URL de prévisualisation par branche) |
| Build variables              | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_ENV`, `NEXT_PUBLIC_FIREBASE_*` |

- Le nom du Worker dans le tableau de bord doit être identique au `name` de `wrangler.jsonc` (`sece-site`).
- Les `NEXT_PUBLIC_*` vont dans les variables **de build** (elles sont figées dans le code compilé), pas dans les variables d'exécution.
- Jusqu'au lancement : `NEXT_PUBLIC_SITE_ENV=preview` (noindex partout). Au lancement : `production`, puis rattacher `smarteyecivilengineering.com` dans Settings → Domains & Routes.
- Le bucket R2 du cache des pages, `sece-site-opennext-cache`, existe déjà.

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
- [ ] Phase 2 – Back-office et données (Firestore, Firebase Auth, médias R2, seed)
- [ ] Phase 3 – Pages publiques
- [ ] Phase 4 – Projets et 3D
- [ ] Phase 5 – Animations
- [ ] Phase 6 – SEO et performance
- [ ] Phase 7 – Recette et livraison
