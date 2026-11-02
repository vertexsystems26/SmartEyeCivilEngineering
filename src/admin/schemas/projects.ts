import { L, emptySeo, localizedText, options } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";
import { COUNTRIES, SOFTWARE, STANDARDS, STRUCTURE_TYPES, seoField, toCompleteField } from "./shared";

export const PROJECT_CONTEXTS = options({
  sece: "Réalisé par S.E.C.E",
  collaboration: "En collaboration avec…",
  "engineer-experience": "Expérience de notre ingénieur conseil",
});

export const projectsSchema: CollectionSchema = {
  slug: "projets",
  collection: "projects",
  revalidate: "projects",
  labels: { singular: "projet", plural: "Projets", newItem: "Nouveau projet" },
  description:
    "Références affichées sur le site. Les projets antérieurs à décembre 2020 doivent porter le contexte « Expérience de notre ingénieur conseil ».",
  titleField: "title",
  orderField: "order",
  columns: [
    { label: "Lieu", value: (d) => [localizedText(d.city), String(d.country ?? "")].filter(Boolean).join(", ") },
    {
      label: "Contexte",
      value: (d) => PROJECT_CONTEXTS.find((o) => o.value === d.context)?.label ?? "",
    },
  ],
  defaults: () => ({
    status: "draft",
    title: L(),
    slug: L(),
    featured: false,
    order: 99,
    categories: [],
    summary: L(),
    context: "sece",
    partner: "",
    employer: "",
    client: "",
    country: "tunisie",
    city: L(),
    periodStart: "",
    periodEnd: "",
    area: null,
    levels: L(),
    structureType: [],
    role: L(),
    services: [],
    standards: [],
    software: [],
    partners: "",
    body: { fr: null, en: null },
    cover: null,
    gallery: [],
    videoUrl: "",
    model: { file: null, poster: null, autoRotate: true, cameraOrbit: "", exposure: 1, hotspots: [] },
    seo: emptySeo(),
    toComplete: [],
  }),
  publicPath: (d, locale) => {
    const slug = localizedText(d.slug, locale);
    return slug ? (locale === "en" ? `/en/projects/${slug}` : `/projets/${slug}`) : null;
  },
  tabs: [
    {
      label: "Général",
      fields: [
        { name: "title", type: "text", label: "Titre", localized: true, required: true, maxLength: 120 },
        { name: "slug", type: "slug", from: "title", label: "Adresse de la page" },
        {
          name: "summary",
          type: "textarea",
          label: "Résumé",
          localized: true,
          required: true,
          maxLength: 160,
          description: "160 caractères maximum. Affiché sur les cartes et utilisé par Google si le SEO est vide.",
        },
        {
          name: "context",
          type: "select",
          label: "Contexte d'intervention",
          options: PROJECT_CONTEXTS,
          required: true,
          half: true,
          description: "Étiquette affichée sur la carte du projet (règle d'honnêteté sur les références).",
        },
        {
          name: "partner",
          type: "text",
          label: "Partenaire de la collaboration",
          half: true,
          description: "Uniquement pour « En collaboration avec… », par exemple « BATIS ingénierie ».",
        },
        {
          name: "employer",
          type: "text",
          label: "Société de l'ingénieur à l'époque",
          description: "Uniquement pour « Expérience de notre ingénieur conseil ». Texte seul, jamais de logo.",
        },
        {
          name: "categories",
          type: "relation",
          label: "Catégories",
          collection: "categories",
          many: true,
          filter: { kind: "project" },
        },
        { name: "featured", type: "checkbox", label: "À la une sur l'accueil", half: true },
        toCompleteField,
      ],
    },
    {
      label: "Technique",
      fields: [
        { name: "client", type: "text", label: "Client ou maître d'ouvrage", half: true },
        { name: "country", type: "select", label: "Pays", options: COUNTRIES, half: true },
        { name: "city", type: "text", label: "Ville ou site", localized: true, half: true },
        { name: "role", type: "text", label: "Rôle / mission", localized: true, half: true },
        { name: "periodStart", type: "text", label: "Début", placeholder: "09/2014 ou 2018", half: true },
        { name: "periodEnd", type: "text", label: "Fin", placeholder: "08/2018, vide si en cours", half: true },
        { name: "area", type: "number", label: "Surface", unit: "m²", min: 0, half: true },
        {
          name: "levels",
          type: "text",
          label: "Niveaux",
          localized: true,
          placeholder: "2 sous-sols + R+4",
          half: true,
        },
        { name: "structureType", type: "multiselect", label: "Type de structure", options: STRUCTURE_TYPES },
        { name: "services", type: "relation", label: "Services concernés", collection: "services", many: true },
        { name: "standards", type: "tags", label: "Normes", suggestions: STANDARDS, half: true },
        { name: "software", type: "tags", label: "Logiciels", suggestions: SOFTWARE, half: true },
        { name: "partners", type: "text", label: "Autres partenaires", description: "Architecte, bureau de contrôle…" },
      ],
    },
    {
      label: "Texte",
      fields: [
        {
          name: "body",
          type: "richtext",
          label: "Présentation du projet",
          localized: true,
          description: "Contexte, enjeux structurels, solutions, résultat. Visez au moins 250 mots.",
        },
      ],
    },
    {
      label: "Médias",
      fields: [
        {
          name: "cover",
          type: "image",
          label: "Image de couverture",
          description: "Format paysage conseillé. Cliquez sur l'aperçu pour choisir le point focal.",
        },
        {
          name: "gallery",
          type: "gallery",
          label: "Galerie photos",
          description: "Glissez-déposez plusieurs images. Le texte alternatif se règle dans la médiathèque.",
        },
        { name: "videoUrl", type: "text", label: "Vidéo (URL YouTube ou Vimeo)" },
      ],
    },
    {
      label: "3D",
      fields: [
        {
          name: "model",
          type: "group",
          label: "Modèle 3D",
          description:
            "Fichier GLB recommandé (glTF accepté). Au-delà de 15 Mo le chargement devient lent ; 30 Mo maximum. Voir la page Aide.",
          fields: [
            { name: "file", type: "file", accept: "model", label: "Fichier du modèle" },
            {
              name: "poster",
              type: "image",
              label: "Image d'attente (poster)",
              description: "Affichée avant l'activation du modèle.",
            },
            { name: "autoRotate", type: "checkbox", label: "Rotation automatique", half: true },
            { name: "exposure", type: "number", label: "Exposition", min: 0.1, step: 0.1, half: true },
            {
              name: "cameraOrbit",
              type: "text",
              label: "Vue de départ",
              placeholder: "45deg 65deg 120m",
              description: "Angle horizontal, angle vertical, distance. Réglable visuellement en phase 4.",
            },
            {
              name: "hotspots",
              type: "array",
              label: "Points d'intérêt",
              addLabel: "Ajouter un point",
              itemLabel: (item) => localizedText(item.label) || "Nouveau point",
              fields: [
                { name: "label", type: "text", label: "Étiquette", localized: true, required: true },
                { name: "text", type: "textarea", label: "Texte", localized: true, rows: 3 },
                { name: "position", type: "text", label: "Position (x y z)", half: true, placeholder: "0m 12m 4m" },
                { name: "normal", type: "text", label: "Orientation (x y z)", half: true, placeholder: "0 1 0" },
              ],
            },
          ],
        },
      ],
    },
    { label: "SEO", fields: [seoField] },
  ],
};
