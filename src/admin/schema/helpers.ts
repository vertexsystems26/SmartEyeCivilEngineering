import type { Localized } from "@/lib/cms/types";
import type { CollectionSchema, FieldDef, Option } from "./types";

export const L = (fr = "", en = ""): Localized => ({ fr, en });
export const emptySeo = () => ({ title: L(), description: L(), image: null, noindex: false });

/** "Étude de structure béton" → "etude-de-structure-beton" */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const options = (entries: Record<string, string>): Option[] =>
  Object.entries(entries).map(([value, label]) => ({ value, label }));

export function localizedText(value: unknown, locale: "fr" | "en" = "fr"): string {
  if (value && typeof value === "object" && locale in value) return String((value as Localized)[locale] ?? "");
  return typeof value === "string" ? value : "";
}

export function docTitle(schema: CollectionSchema, doc: Record<string, unknown>) {
  return localizedText(doc[schema.titleField]) || localizedText(doc[schema.titleField], "en") || "(sans titre)";
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object" && "type" in (value as object) && (value as { type: string }).type === "doc") {
    const content = (value as { content?: { content?: unknown[] }[] }).content ?? [];
    return content.every((node) => !node.content || node.content.length === 0);
  }
  return false;
}

export type Issue = { path: string; label: string; message: string };

/** Walks the schema and reports required fields left empty (FR is the reference language). */
export function validate(fields: FieldDef[], data: Record<string, unknown>, prefix = ""): Issue[] {
  const issues: Issue[] = [];
  for (const field of fields) {
    const value = data?.[field.name];
    const path = `${prefix}${field.name}`;
    if (field.type === "group") {
      issues.push(...validate(field.fields, (value ?? {}) as Record<string, unknown>, `${path}.`));
      continue;
    }
    if (field.type === "array") {
      ((value ?? []) as Record<string, unknown>[]).forEach((item, i) =>
        issues.push(...validate(field.fields, item, `${path}.${i}.`)),
      );
      continue;
    }
    if (!field.required) continue;
    const target = field.localized || field.type === "slug" ? (value as Localized | undefined)?.fr : value;
    if (isEmpty(target)) issues.push({ path, label: field.label, message: "Champ obligatoire" });
  }
  return issues;
}

/** Localized fields filled in French but empty in English. */
export function missingTranslations(fields: FieldDef[], data: Record<string, unknown>, prefix = ""): string[] {
  const missing: string[] = [];
  for (const field of fields) {
    const value = data?.[field.name];
    if (field.type === "group")
      missing.push(
        ...missingTranslations(field.fields, (value ?? {}) as Record<string, unknown>, `${prefix}${field.label} › `),
      );
    else if (field.type === "array")
      ((value ?? []) as Record<string, unknown>[]).forEach((item, i) =>
        missing.push(...missingTranslations(field.fields, item, `${prefix}${field.label} ${i + 1} › `)),
      );
    else if ((field.localized || field.type === "slug") && value && typeof value === "object") {
      const v = value as Localized<unknown>;
      if (!isEmpty(v.fr) && isEmpty(v.en)) missing.push(`${prefix}${field.label}`);
    }
  }
  return missing;
}

export const allFields = (schema: CollectionSchema) => schema.tabs.flatMap((tab) => tab.fields);
