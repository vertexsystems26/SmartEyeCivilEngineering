import { L, emptySeo, localizedText } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";
import { SOFTWARE, STANDARDS, seoField, toCompleteField } from "./shared";

export const aboutSchema: CollectionSchema = {
  slug: "a-propos",
  collection: "settings/about",
  singleton: true,
  revalidate: "settings",
  labels: { singular: "page À propos", plural: "À propos", newItem: "", feminine: true },
  description: "Présentation de la société, valeurs, ingénierie de la valeur et parcours de l'ingénieur conseil.",
  titleField: "founderName",
  defaults: () => ({
    status: "published",
    intro: { fr: null, en: null },
    mission: { fr: null, en: null },
    values: [],
    valueEngineering: { fr: null, en: null },
    standards: [],
    software: [],
    founder: { name: "", title: L(), photo: null, bio: { fr: null, en: null } },
    education: [],
    memberships: [],
    languages: [],
    qualities: { fr: [], en: [] },
    timeline: [],
    seo: emptySeo(),
    toComplete: [],
  }),
  publicPath: (_d, locale) => (locale === "en" ? "/en/about" : "/a-propos"),
  tabs: [
    {
      label: "Société",
      fields: [
        { name: "intro", type: "richtext", label: "Présentation de la société", localized: true, required: true },
        { name: "mission", type: "richtext", label: "Mission", localized: true },
        {
          name: "values",
          type: "array",
          label: "Valeurs",
          addLabel: "Ajouter une valeur",
          itemLabel: (item) => localizedText(item.title) || "Nouvelle valeur",
          fields: [
            { name: "title", type: "text", label: "Titre", localized: true, required: true },
            { name: "text", type: "textarea", label: "Texte", localized: true, rows: 3 },
          ],
        },
        toCompleteField,
      ],
    },
    {
      label: "Savoir-faire",
      fields: [
        {
          name: "valueEngineering",
          type: "richtext",
          label: "Ingénierie de la valeur",
          localized: true,
          description: "Texte de la section détaillée sur la méthode Value Engineering.",
        },
        { name: "standards", type: "tags", label: "Normes et codes", suggestions: STANDARDS },
        { name: "software", type: "tags", label: "Logiciels maîtrisés", suggestions: SOFTWARE },
      ],
    },
    {
      label: "Ingénieur conseil",
      fields: [
        {
          name: "founder",
          type: "group",
          label: "Ingénieur conseil",
          fields: [
            { name: "name", type: "text", label: "Nom", required: true, half: true },
            { name: "title", type: "text", label: "Titre", localized: true, half: true },
            { name: "photo", type: "image", label: "Photo" },
            { name: "bio", type: "richtext", label: "Biographie", localized: true },
          ],
        },
        {
          name: "education",
          type: "array",
          label: "Formation",
          addLabel: "Ajouter un diplôme",
          itemLabel: (item) =>
            [localizedText(item.title), item.year].filter(Boolean).join(" · ") || String(item.school ?? "Diplôme"),
          fields: [
            { name: "title", type: "text", label: "Diplôme", localized: true },
            { name: "school", type: "text", label: "Établissement", required: true },
            { name: "year", type: "text", label: "Année", half: true },
          ],
        },
        {
          name: "memberships",
          type: "array",
          label: "Adhésions professionnelles",
          addLabel: "Ajouter une adhésion",
          description: "Seules les adhésions cochées « Validée pour publication » apparaissent sur le site.",
          itemLabel: (item) => `${localizedText(item.label) || "Adhésion"}${item.validated ? "" : " · non validée"}`,
          fields: [
            { name: "label", type: "text", label: "Organisme", localized: true, required: true },
            { name: "number", type: "text", label: "Numéro", half: true },
            { name: "validated", type: "checkbox", label: "Validée pour publication", half: true },
          ],
        },
        {
          name: "languages",
          type: "array",
          label: "Langues",
          addLabel: "Ajouter une langue",
          itemLabel: (item) => localizedText(item.language) || "Langue",
          fields: [
            { name: "language", type: "text", label: "Langue", localized: true, half: true },
            { name: "level", type: "text", label: "Niveau", localized: true, half: true },
          ],
        },
        { name: "qualities", type: "tags", label: "Qualités professionnelles", localized: true },
      ],
    },
    {
      label: "Parcours",
      fields: [
        {
          name: "timeline",
          type: "array",
          label: "Frise chronologique",
          addLabel: "Ajouter une étape",
          description:
            "Du plus récent au plus ancien. Les étapes antérieures à 12/2020 portent automatiquement la mention « Expérience de notre ingénieur conseil ».",
          itemLabel: (item) => `${item.start || "?"} → ${item.end || "aujourd'hui"} · ${item.organization || ""}`,
          fields: [
            { name: "start", type: "text", label: "Début", placeholder: "08/2018", half: true },
            { name: "end", type: "text", label: "Fin", placeholder: "vide = aujourd'hui", half: true },
            { name: "organization", type: "text", label: "Structure", required: true, half: true },
            { name: "location", type: "text", label: "Lieu", half: true },
            { name: "role", type: "text", label: "Poste", localized: true },
            { name: "project", type: "text", label: "Projet principal", localized: true },
          ],
        },
      ],
    },
    { label: "SEO", fields: [seoField] },
  ],
};
