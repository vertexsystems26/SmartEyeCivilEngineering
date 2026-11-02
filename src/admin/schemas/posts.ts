import { L, emptySeo, localizedText } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";
import { seoField, toCompleteField } from "./shared";

export const postsSchema: CollectionSchema = {
  slug: "actualites",
  collection: "posts",
  revalidate: "posts",
  labels: { singular: "article", plural: "Actualités", newItem: "Nouvel article" },
  description: "Articles techniques et actualités. Un article publié apparaît immédiatement sur le site.",
  titleField: "title",
  columns: [{ label: "Date", value: (d) => String(d.date ?? "") }],
  defaults: () => ({
    status: "draft",
    title: L(),
    slug: L(),
    category: "",
    excerpt: L(),
    body: { fr: null, en: null },
    cover: null,
    author: "Hichem Haddad",
    date: new Date().toISOString().slice(0, 10),
    related: [],
    seo: emptySeo(),
    toComplete: [],
  }),
  publicPath: (d, locale) => {
    const slug = localizedText(d.slug, locale);
    return slug ? (locale === "en" ? `/en/news/${slug}` : `/actualites/${slug}`) : null;
  },
  tabs: [
    {
      label: "Article",
      fields: [
        { name: "title", type: "text", label: "Titre", localized: true, required: true, maxLength: 120 },
        { name: "slug", type: "slug", from: "title", label: "Adresse de la page" },
        {
          name: "excerpt",
          type: "textarea",
          label: "Chapô",
          localized: true,
          maxLength: 240,
          description: "Résumé de deux ou trois lignes affiché dans la liste des articles.",
        },
        {
          name: "body",
          type: "richtext",
          label: "Texte",
          localized: true,
          required: true,
          description: "Utilisez des intertitres (Titre 2, Titre 3) : ils forment le sommaire automatique.",
        },
      ],
    },
    {
      label: "Publication",
      fields: [
        {
          name: "category",
          type: "relation",
          label: "Catégorie",
          collection: "categories",
          filter: { kind: "post" },
          half: true,
        },
        { name: "date", type: "date", label: "Date de publication", half: true },
        { name: "author", type: "text", label: "Auteur", half: true },
        { name: "cover", type: "image", label: "Image de couverture" },
        { name: "related", type: "relation", label: "Articles liés", collection: "posts", many: true },
        toCompleteField,
      ],
    },
    { label: "SEO", fields: [seoField] },
  ],
};
