import type { RevalidatableCollection } from "@/lib/cms/collections";
import type { Locale } from "@/lib/cms/types";

/*
 * Declarative content schemas. One schema drives the list page, the editor
 * (tabs, fields, help texts), defaults, validation and translation checks.
 */

type Base = {
  name: string;
  label: string;
  /** Help text shown under the field (brief §7: a description under each field). */
  description?: string;
  required?: boolean;
  /** Stored as { fr, en }; the editor shows the language selected at the top. */
  localized?: boolean;
  half?: boolean;
};

export type Option = { value: string; label: string };

export type FieldDef =
  | (Base & { type: "text"; maxLength?: number; placeholder?: string })
  | (Base & { type: "textarea"; maxLength?: number; rows?: number })
  | (Base & { type: "slug"; from: string })
  | (Base & { type: "number"; min?: number; step?: number; unit?: string })
  | (Base & { type: "checkbox" })
  | (Base & { type: "select"; options: Option[] })
  | (Base & { type: "multiselect"; options: Option[] })
  | (Base & { type: "tags"; suggestions?: string[] })
  | (Base & { type: "date" })
  | (Base & { type: "richtext" })
  | (Base & { type: "image" })
  | (Base & { type: "file"; accept: "model" | "document" })
  | (Base & { type: "gallery" })
  | (Base & { type: "relation"; collection: string; many?: boolean; filter?: Record<string, string> })
  | (Base & {
      type: "array";
      fields: FieldDef[];
      itemLabel?: (item: Record<string, unknown>) => string;
      addLabel: string;
    })
  | (Base & { type: "group"; fields: FieldDef[] })
  | (Base & { type: "seo" });

export type Tab = { label: string; fields: FieldDef[] };

export type ListColumn = {
  label: string;
  value: (doc: Record<string, unknown>) => string;
};

export type CollectionSchema = {
  /** URL segment in /admin, e.g. "projets". */
  slug: string;
  /** Firestore collection, or "settings/<id>" for a single page document. */
  collection: string;
  singleton?: boolean;
  revalidate: RevalidatableCollection;
  labels: { singular: string; plural: string; newItem: string; feminine?: boolean };
  description: string;
  titleField: string;
  /** Collections ordered manually show up/down controls in the list. */
  orderField?: string;
  tabs: Tab[];
  columns?: ListColumn[];
  defaults: () => Record<string, unknown>;
  /** Public URL of a document, for the "Voir sur le site" button. */
  publicPath?: (doc: Record<string, unknown>, locale: Locale) => string | null;
};
