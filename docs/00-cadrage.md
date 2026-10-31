# Phase 0 — Plan d'architecture S.E.C.E

> Statut : **validé le 31/10/2026** (domaine, hébergement Cloudflare, Firestore sans Payload, rédaction pédagogique des textes longs).
> Versions vérifiées le 31/10/2026 : Next.js 16.4.3, React 19.3, next-intl 4.14.9, Tailwind CSS 4.3.3, @opennextjs/cloudflare 1.20.15, Motion 14.9.0, Lenis 1.3.27, @google/model-viewer 4.4.0.

## 1. Décisions validées

| Sujet        | Décision                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Domaine      | `smarteyecivilengineering.com` (préproduction sur `*.workers.dev`, toujours en noindex)                            |
| Hébergement  | Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)                                                         |
| Données      | Firebase Firestore, projet `smarteyecivilengineering-578e2`                                                        |
| Back-office  | **Sur mesure** dans le même projet Next.js (`/admin`), Firebase Auth + Firestore, pas de Payload                   |
| Médias       | Cloudflare R2, bucket `sece-storage` (public via `media.smarteyecivilengineering.com`) + bucket privé devis        |
| Textes longs | Textes pédagogiques (sans chiffre, client ni promesse inventés), publiés après relecture du client                 |
| Mesure       | Cloudflare Web Analytics (sans cookies, aucune bannière). Firebase Analytics/GA4 non utilisé : il pose des cookies |

## 2. Arborescence

```
FR (racine)                         EN (/en)                    Rendu
/                                   /en                         statique + revalidation par tags
/a-propos                           /en/about                   statique
/services · /services/[slug]        /en/services · /[slug]      statique (generateStaticParams)
/projets · /projets/[slug]          /en/projects · /[slug]      liste nue statique ; filtres dynamiques + cache taggé
/equipe                             /en/team                    statique
/actualites · /actualites/[slug]    /en/news · /[slug]          statique
/contact · /devis                   /en/contact · /en/quote     statique + Server Actions
/faq                                /en/faq                     statique
/mentions-legales                   /en/legal-notice            statique
/politique-de-confidentialite       /en/privacy-policy          statique
not-found · error                   idem
/admin  (back-office, racine de mise en page séparée, noindex)  ·  /api (revalidation, envois, tâches)
sitemap.xml · robots.txt · opengraph-image par page · manifest
```

## 3. Architecture technique

```
Navigateur ── Cloudflare (CDN, Turnstile, Web Analytics)
   │
   ├─ Site public ── Worker Next.js (OpenNext) ── cache des pages : R2 + tags (D1) + file (Durable Object)
   │                      │ lecture serveur : API REST Firestore + compte de service (JWT signé en WebCrypto)
   │                      └ formulaires : Server Actions → Firestore + Resend + R2 privé
   │
   └─ /admin ── SDK web Firebase (Auth + Firestore) ── règles de sécurité par rôle (custom claims)
                    │ envoi de fichiers : URL présignée → R2 direct
                    └ publication → /api/revalidate (jeton Firebase vérifié) → revalidateTag
```

- **Pourquoi l'API REST côté serveur** : `firebase-admin` repose sur gRPC, qui ne fonctionne pas dans un Worker Cloudflare. Un petit client REST typé (lecture, requêtes, écritures par lot) le remplace.
- **Authentification** : Firebase Auth (e-mail + mot de passe, hachage scrypt géré par Google, protection native contre les tentatives répétées). Double authentification TOTP via l'option Identity Platform du projet Firebase. Rôles Administrateur / Éditeur / Commercial en _custom claims_, attribués depuis l'admin.
- **Publication** : statut brouillon / publié / planifié ; une tâche planifiée Cloudflare (toutes les 5 min) publie les contenus planifiés. Chaque enregistrement écrit une version dans une sous-collection `versions` (historique, restauration) et une ligne de journal d'audit.
- **Aperçu** : `draftMode` de Next.js, lecture des brouillons réservée aux sessions admin.
- **Images** : `next/image` optimisé par Cloudflare Images (binding `IMAGES`), formats AVIF/WebP.

## 4. Modèle de données (Firestore)

`L` = champ localisé `{ fr, en }`. Un champ factuel absent des sources reste vide ; la liste interne `toComplete[]` (visible seulement dans l'admin) alimente l'alerte « À compléter » du tableau de bord. Le rendu public ignore les champs vides.

| Collection                         | Champs principaux                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projects`                         | titre L, slug L, statut, `publishAt`, à la une, ordre, catégories, résumé L (160), contexte (`sece` · `collaboration` + partenaire · `engineer-experience` + employeur d'alors), technique (client, pays, ville, période, surface, niveaux, structure, rôle, services, normes, logiciels, partenaires), contenu L (contexte, enjeux, solutions, résultat), médias (couverture + point focal, galerie {média, légende L}, vidéo), 3D (GLB, poster, rotation, vue de départ, exposition, hotspots), SEO |
| `services`                         | titre L, slug L, ordre, icône, résumé L, corps L, livrables L, phases, normes, logiciels, FAQ, SEO                                                                                                                                                                                                                                                                                                                                                                                                    |
| `team`                             | nom, poste L, photo, bio L, spécialités, LinkedIn, `isLead` ; ingénieur conseil : formation[], adhésions[] (case « validée pour publication »), langues, compétences, parcours[]                                                                                                                                                                                                                                                                                                                      |
| `posts` · `categories`             | article : titre L, slug L, catégorie, extrait, corps (sommaire auto), couverture, auteur, date, temps de lecture calculé, articles liés · catégorie : nom L, slug L, type                                                                                                                                                                                                                                                                                                                             |
| `faqs` · `testimonials`            | question/réponse L, portée (accueil, générale, service) · avis réel avec case « autorisé » obligatoire ; section masquée si vide                                                                                                                                                                                                                                                                                                                                                                      |
| `messages` · `quotes`              | données du formulaire, consentement daté, statut (Nouveau, En cours, Traité, Archivé), notes internes, pièces jointes (R2 privé), date de purge                                                                                                                                                                                                                                                                                                                                                       |
| `media`                            | clé R2, type (image, modèle 3D, document), alt L obligatoire, légende L, tags, empreinte (anti-doublon), dimensions, poids, références (« Où est-il utilisé ? »)                                                                                                                                                                                                                                                                                                                                      |
| `redirects` · `users` · `auditLog` | 301 · profil + rôle · journal des modifications                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `settings/*`                       | `site` (identité, NAP, Plus Code, GPS, horaires, réseaux, WhatsApp activable, vérifications, données légales), `navigation`, `home` (ordre et activation des sections, hero, chiffres clés), `about`, `legal`                                                                                                                                                                                                                                                                                         |

Chiffres clés : seuls les 6 autorisés ; « années d'expérience » = année courante − 2005, libellé « de notre ingénieur conseil ».

## 5. Écarts au brief

1. **CSP à nonces et pages statiques** : un nonce par requête oblige à rendre chaque page dynamiquement. → CSP stricte **par hachages** sur le site public, nonces réservés à `/admin` (phase 6).
2. **Hachage argon2/bcrypt** : sans objet, Firebase Auth hache les mots de passe (scrypt) et gère le verrouillage.
3. **Back-office sur mesure** : c'est désormais le plus gros chantier du projet. Les fonctions de la partie 7 restent prévues ; l'ordre de livraison est : édition et publication, médias, réception (phase 2), puis versions, aperçu, planification, alertes SEO (phases 2 à 4).
4. **Fichiers lourds** : envoi direct navigateur → R2 par URL présignée, contrôle serveur du type réel et de la taille ensuite.
5. **Hero React Three Fiber** : retiré de la v1 (three.js ≈ 150 ko gzip, budget de 40 ko) ; l'ossature SVG animée porte l'effet.
6. **Filtres de projets** : `/projets` sans filtre reste statique ; les combinaisons filtrées sont en `noindex` avec canonical vers la liste.
7. **`proxy.ts` de Next 16** : expérimental sur Cloudflare ; on garde `middleware.ts` (edge), pleinement pris en charge.
8. **View Transitions** : amélioration progressive, navigation normale si le navigateur ne la gère pas.

## 6. Points encore ouverts

**Pour la phase 2**

1. **Compte de service Firebase** : Console Firebase → Paramètres du projet → Comptes de service → « Générer une nouvelle clé privée ». Déposer le fichier JSON dans le dossier du projet, sans le coller dans une conversation (le dépôt l'ignore déjà).
2. **Activer** dans la console : Firestore (mode natif, région `eur3` ou `europe-west1`), Authentication (e-mail/mot de passe), et l'option Identity Platform pour la double authentification.
3. **Fichiers** : logo (SVG si possible), brochure PDF, CV.
4. **Déploiement** : `npx wrangler login` une fois (le jeton R2 fourni ne permet pas de déployer un Worker).

**Avant la mise en ligne** : WhatsApp (numéro, activation), horaires, validation des adhésions (OIT n° 52292, ingénieur conseil agréé n° 0695, Society of Engineers UAE n° 58802), compléments de projets (lieu du Waterfront, Créteil, missions Razi et villas), photo de Hichem Haddad, matricule fiscal, directeur de la publication.
