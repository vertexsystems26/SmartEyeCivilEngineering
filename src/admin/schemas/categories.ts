import { L, options } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";

export const categoriesSchema: CollectionSchema = {
  slug: "categories",
  collection: "categories",
  revalidate: "categories",
  labels: { singular: "catégorie", plural: "Catégories", newItem: "Nouvelle catégorie", feminine: true },
  description: "Catégories des projets (filtres de la page Projets) et des articles.",
  titleField: "name",
  orderField: "order",
  columns: [{ label: "Pour", value: (d) => (d.kind === "post" ? "Articles" : "Projets") }],
  defaults: () => ({ status: "published", name: L(), slug: L(), kind: "project", order: 99, toComplete: [] }),
  tabs: [
    {
      label: "Général",
      fields: [
        { name: "name", type: "text", label: "Nom", localized: true, required: true },
        {
          name: "slug",
          type: "slug",
          from: "name",
          label: "Identifiant dans l'adresse",
          description: "Utilisé dans les filtres, par exemple ?categorie=sante.",
        },
        {
          name: "kind",
          type: "select",
          label: "S'applique aux",
          options: options({ project: "Projets", post: "Articles" }),
        },
      ],
    },
  ],
};
