import { L, emptySeo, localizedText } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";
import { PHASES, SERVICE_ICONS, SOFTWARE, STANDARDS, seoField, toCompleteField } from "./shared";

export const servicesSchema: CollectionSchema = {
  slug: "services",
  collection: "services",
  revalidate: "services",
  labels: { singular: "service", plural: "Services", newItem: "Nouveau service" },
  description: "Les missions proposées par S.E.C.E. L'ordre de cette liste est celui du site.",
  titleField: "title",
  orderField: "order",
  columns: [{ label: "Résumé", value: (d) => localizedText(d.summary).slice(0, 90) }],
  defaults: () => ({
    status: "draft",
    title: L(),
    slug: L(),
    order: 99,
    icon: "frame",
    summary: L(),
    body: { fr: null, en: null },
    deliverables: { fr: [], en: [] },
    phases: [],
    standards: [],
    software: [],
    faq: [],
    seo: emptySeo(),
    toComplete: [],
  }),
  publicPath: (d, locale) => {
    const slug = localizedText(d.slug, locale);
    return slug ? `${locale === "en" ? "/en" : ""}/services/${slug}` : null;
  },
  tabs: [
    {
      label: "Général",
      fields: [
        { name: "title", type: "text", label: "Titre", localized: true, required: true, maxLength: 90 },
        {
          name: "slug",
          type: "slug",
          from: "title",
          label: "Adresse de la page",
          description: "Générée depuis le titre. Ne la modifiez plus une fois la page publiée (liens existants).",
        },
        {
          name: "summary",
          type: "textarea",
          label: "Résumé",
          localized: true,
          required: true,
          maxLength: 220,
          description: "Une ou deux phrases affichées sur les cartes de services.",
        },
        { name: "icon", type: "select", label: "Icône", options: SERVICE_ICONS, half: true },
        toCompleteField,
      ],
    },
    {
      label: "Contenu",
      fields: [
        {
          name: "body",
          type: "richtext",
          label: "Présentation détaillée",
          localized: true,
          description: "Visez 600 mots environ : en quoi consiste la mission, pour qui, comment elle se déroule.",
        },
        {
          name: "deliverables",
          type: "tags",
          label: "Livrables",
          localized: true,
          description: "Un livrable par ligne, par exemple « Notes de calcul ». Appuyez sur Entrée pour ajouter.",
        },
        { name: "phases", type: "multiselect", label: "Phases d'intervention", options: PHASES },
        { name: "standards", type: "tags", label: "Normes", suggestions: STANDARDS, half: true },
        { name: "software", type: "tags", label: "Logiciels", suggestions: SOFTWARE, half: true },
      ],
    },
    {
      label: "FAQ",
      fields: [
        {
          name: "faq",
          type: "array",
          label: "Questions fréquentes du service",
          addLabel: "Ajouter une question",
          description: "Affichées en bas de la page du service et comprises par Google (balisage FAQ).",
          itemLabel: (item) => localizedText(item.question) || "Nouvelle question",
          fields: [
            { name: "question", type: "text", label: "Question", localized: true, required: true },
            { name: "answer", type: "textarea", label: "Réponse", localized: true, required: true, rows: 4 },
          ],
        },
      ],
    },
    { label: "SEO", fields: [seoField] },
  ],
};
