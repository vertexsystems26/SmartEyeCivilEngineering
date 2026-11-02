"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { Localized, MediaRef, RichText, Seo } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";
import { slugify } from "../../schema/helpers";
import type { FieldDef } from "../../schema/types";
import { useFeedback } from "../feedback";
import { Counter, FieldShell, Input, Select, Textarea } from "../ui";
import { FileField, GalleryField, ImageField } from "./media-fields";
import { RelationField } from "./relation-field";
import { RichTextEditor } from "./rich-text";
import { TagsInput } from "./tags-input";

export type FieldContext = {
  locale: "fr" | "en";
  errors: Record<string, string>;
  docId?: string;
  /** Whole document, for fields that depend on others (SEO preview). */
  root: Record<string, unknown>;
};

type Props = {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  path: string;
  ctx: FieldContext;
};

const domId = (path: string) => `f-${path.replace(/[^\w-]/g, "-")}`;

/** "EN manquant" badge on localized fields filled in French only. */
function TranslationBadge({ value, locale }: { value: unknown; locale: "fr" | "en" }) {
  const v = value as Localized<unknown> | undefined;
  const empty = (x: unknown) => x === null || x === undefined || x === "" || (Array.isArray(x) && !x.length);
  if (!v || empty(v.fr) || !empty(v.en)) return null;
  return (
    <span
      className={cn(
        "label-mono rounded-full px-2 py-0.5",
        locale === "en" ? "bg-ink text-paper" : "bg-mist-200 text-pine-700",
      )}
    >
      EN manquant
    </span>
  );
}

export function FieldRenderer({ field, value, onChange, path, ctx }: Props) {
  const id = domId(path);
  const { locale, errors } = ctx;
  const error = errors[path];
  const describedBy =
    [field.description ? `${id}-desc` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;

  const localized = field.localized || field.type === "slug";
  const current = localized ? (value as Localized<unknown> | undefined)?.[locale] : value;
  const setCurrent = (next: unknown) =>
    onChange(localized ? { ...((value as object) ?? { fr: "", en: "" }), [locale]: next } : next);

  const shell = (control: ReactNode, aside?: ReactNode, as: "div" | "fieldset" = "div") => (
    <FieldShell
      id={id}
      as={as}
      label={localized ? `${field.label} (${locale.toUpperCase()})` : field.label}
      description={field.description}
      required={field.required}
      error={error}
      className={field.half ? "md:col-span-1" : "md:col-span-2"}
      aside={
        <span className="flex items-center gap-2">
          {aside}
          {localized ? <TranslationBadge value={value} locale={locale} /> : null}
        </span>
      }
    >
      {control}
    </FieldShell>
  );

  const common = { id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined };

  switch (field.type) {
    case "text":
      return shell(
        <Input
          {...common}
          value={(current as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => setCurrent(e.target.value)}
        />,
        field.maxLength ? <Counter value={(current as string) ?? ""} max={field.maxLength} /> : null,
      );

    case "textarea":
      return shell(
        <Textarea
          {...common}
          rows={field.rows ?? 3}
          value={(current as string) ?? ""}
          onChange={(e) => setCurrent(e.target.value)}
        />,
        field.maxLength ? <Counter value={(current as string) ?? ""} max={field.maxLength} /> : null,
      );

    case "slug":
      return shell(
        <div className="flex gap-2">
          <Input
            {...common}
            value={(current as string) ?? ""}
            onChange={(e) => setCurrent(slugify(e.target.value))}
            className="font-mono text-small"
          />
        </div>,
      );

    case "number":
      return shell(
        <div className="flex items-center gap-2">
          <Input
            {...common}
            type="number"
            inputMode="decimal"
            min={field.min}
            step={field.step ?? 1}
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          />
          {field.unit ? <span className="text-small text-pine-700">{field.unit}</span> : null}
        </div>,
      );

    case "checkbox":
      return (
        <div className={cn("flex flex-col gap-1", field.half ? "md:col-span-1" : "md:col-span-2")}>
          <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              id={id}
              type="checkbox"
              className="size-5 accent-pine-600"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              aria-describedby={describedBy}
            />
            <span className="text-small font-semibold">{field.label}</span>
          </label>
          {field.description ? (
            <p id={`${id}-desc`} className="text-[0.85rem] text-pine-700">
              {field.description}
            </p>
          ) : null}
        </div>
      );

    case "select":
      return shell(
        <Select {...common} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>,
      );

    case "multiselect": {
      const selected = new Set((value as string[]) ?? []);
      return shell(
        <div className="flex flex-wrap gap-2" role="group" aria-describedby={describedBy}>
          {field.options.map((o) => (
            <label
              key={o.value}
              className={cn(
                "flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 text-small",
                selected.has(o.value) ? "border-pine-600 bg-pine-600 text-paper" : "border-sage-300 bg-paper",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selected.has(o.value)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(o.value);
                  else next.delete(o.value);
                  onChange(field.options.map((x) => x.value).filter((v) => next.has(v)));
                }}
              />
              {o.label}
            </label>
          ))}
        </div>,
        undefined,
        "fieldset",
      );
    }

    case "tags":
      return shell(
        <TagsInput
          id={id}
          value={(current as string[]) ?? []}
          onChange={setCurrent}
          suggestions={field.suggestions}
          describedBy={describedBy}
        />,
      );

    case "date":
      return shell(
        <Input {...common} type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />,
      );

    case "richtext":
      return shell(
        // Remount per language so each language keeps its own document.
        <RichTextEditor
          key={`${path}-${locale}`}
          id={id}
          value={(current as RichText | null) ?? null}
          onChange={setCurrent}
          describedBy={describedBy}
        />,
      );

    case "image":
      return shell(
        <ImageField value={(value as MediaRef | null) ?? null} onChange={onChange} />,
        undefined,
        "fieldset",
      );

    case "file":
      return shell(
        <FileField value={(value as MediaRef | null) ?? null} onChange={onChange} accept={field.accept} />,
        undefined,
        "fieldset",
      );

    case "gallery":
      return shell(
        <GalleryField value={(value as never) ?? []} onChange={onChange} locale={locale} />,
        undefined,
        "fieldset",
      );

    case "relation":
      return shell(
        <RelationField
          id={id}
          collection={field.collection}
          many={field.many}
          filter={field.filter}
          value={(value as string | string[]) ?? (field.many ? [] : "")}
          onChange={onChange}
          describedBy={describedBy}
          excludeId={ctx.docId}
        />,
        undefined,
        field.many ? "fieldset" : "div",
      );

    case "group": {
      const group = (value ?? {}) as Record<string, unknown>;
      return (
        <fieldset className="grid gap-5 rounded-card border border-line bg-sand-100/60 p-4 md:col-span-2 md:grid-cols-2 md:p-5">
          <legend className="px-1 font-display text-lg font-semibold">{field.label}</legend>
          {field.description ? (
            <p className="-mt-2 text-[0.85rem] text-pine-700 md:col-span-2">{field.description}</p>
          ) : null}
          {field.fields.map((sub) => (
            <FieldRenderer
              key={sub.name}
              field={sub}
              value={group[sub.name]}
              onChange={(v) => onChange({ ...group, [sub.name]: v })}
              path={`${path}.${sub.name}`}
              ctx={ctx}
            />
          ))}
        </fieldset>
      );
    }

    case "array":
      return (
        <ArrayField
          field={field}
          value={(value as Record<string, unknown>[]) ?? []}
          onChange={onChange}
          path={path}
          ctx={ctx}
        />
      );

    case "seo":
      return <SeoField value={value as Seo} onChange={onChange} path={path} ctx={ctx} />;
  }
}

/* ---------- Repeatable items ---------- */

function emptyItem(fields: FieldDef[]): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((f) => {
      if (f.type === "checkbox") return [f.name, false];
      if (f.type === "number") return [f.name, null];
      if (f.type === "tags" || f.type === "multiselect" || f.type === "gallery")
        return [f.name, f.localized ? { fr: [], en: [] } : []];
      if (f.type === "richtext") return [f.name, { fr: null, en: null }];
      if (f.type === "image" || f.type === "file") return [f.name, null];
      if (f.type === "array") return [f.name, []];
      if (f.type === "group") return [f.name, emptyItem(f.fields)];
      return [f.name, f.localized || f.type === "slug" ? { fr: "", en: "" } : ""];
    }),
  );
}

function ArrayField({
  field,
  value,
  onChange,
  path,
  ctx,
}: {
  field: Extract<FieldDef, { type: "array" }>;
  value: Record<string, unknown>[];
  onChange: (v: unknown) => void;
  path: string;
  ctx: FieldContext;
}) {
  const { confirm } = useFeedback();
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <fieldset className="flex flex-col gap-3 md:col-span-2">
      <legend className="mb-1 text-small font-semibold">{field.label}</legend>
      {field.description ? <p className="text-[0.85rem] text-pine-700">{field.description}</p> : null}
      {value.length === 0 ? (
        <p className="rounded-control border border-dashed border-sage-300 px-4 py-3 text-small text-pine-700">
          Aucun élément.
        </p>
      ) : null}
      <ol className="flex flex-col gap-2">
        {value.map((item, i) => (
          <li key={i}>
            <details
              className="group rounded-control border border-line bg-paper"
              open={!field.itemLabel?.(item)?.trim() || undefined}
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-3 text-small font-semibold">
                <span className="label-mono text-pine-700">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 truncate">{field.itemLabel?.(item) ?? `Élément ${i + 1}`}</span>
                <span aria-hidden="true" className="text-pine-700 transition-transform group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="grid gap-5 border-t border-line p-4 md:grid-cols-2">
                {field.fields.map((sub) => (
                  <FieldRenderer
                    key={sub.name}
                    field={sub}
                    value={item[sub.name]}
                    onChange={(v) => {
                      const next = [...value];
                      next[i] = { ...item, [sub.name]: v };
                      onChange(next);
                    }}
                    path={`${path}.${i}.${sub.name}`}
                    ctx={ctx}
                  />
                ))}
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <Button variant="ghost" size="sm" onClick={() => move(i, i - 1)} disabled={i === 0}>
                    ↑ Monter
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => move(i, i + 1)} disabled={i === value.length - 1}>
                    ↓ Descendre
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Supprimer cet élément ?",
                        message: "Il sera retiré à l'enregistrement.",
                        confirmLabel: "Supprimer",
                        danger: true,
                      });
                      if (ok) onChange(value.filter((_, j) => j !== i));
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </details>
          </li>
        ))}
      </ol>
      <Button
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, emptyItem(field.fields)])}
      >
        + {field.addLabel}
      </Button>
    </fieldset>
  );
}

/* ---------- SEO block with Google snippet preview ---------- */

function SeoField({
  value,
  onChange,
  path,
  ctx,
}: {
  value: Seo;
  onChange: (v: unknown) => void;
  path: string;
  ctx: FieldContext;
}) {
  const seo: Seo = value ?? { title: { fr: "", en: "" }, description: { fr: "", en: "" }, image: null, noindex: false };
  const { locale } = ctx;
  const fallbackTitle = ((ctx.root.title ?? ctx.root.name) as Localized | undefined)?.[locale] ?? "";
  const fallbackDesc = ((ctx.root.summary ?? ctx.root.excerpt) as Localized | undefined)?.[locale] ?? "";
  const title = seo.title?.[locale] || fallbackTitle;
  const description = seo.description?.[locale] || fallbackDesc;
  const suffix =
    locale === "fr"
      ? " | S.E.C.E – Bureau d'études structures Tunis"
      : " | S.E.C.E – Structural Engineering Firm, Tunis";

  return (
    <div className="grid gap-5 md:col-span-2 md:grid-cols-2">
      <FieldRenderer
        field={{
          name: "title",
          type: "text",
          label: "Titre pour Google",
          localized: true,
          maxLength: 60,
          description: "60 caractères maximum, mot-clé principal au début.",
        }}
        value={seo.title}
        onChange={(v) => onChange({ ...seo, title: v })}
        path={`${path}.title`}
        ctx={ctx}
      />
      <FieldRenderer
        field={{ name: "image", type: "image", label: "Image de partage (réseaux sociaux)", half: true }}
        value={seo.image}
        onChange={(v) => onChange({ ...seo, image: v })}
        path={`${path}.image`}
        ctx={ctx}
      />
      <FieldRenderer
        field={{
          name: "description",
          type: "textarea",
          label: "Description pour Google",
          localized: true,
          maxLength: 160,
          rows: 3,
          description: "Entre 140 et 160 caractères : ce qui donne envie de cliquer.",
        }}
        value={seo.description}
        onChange={(v) => onChange({ ...seo, description: v })}
        path={`${path}.description`}
        ctx={ctx}
      />
      <FieldRenderer
        field={{ name: "noindex", type: "checkbox", label: "Masquer cette page des moteurs de recherche", half: true }}
        value={seo.noindex}
        onChange={(v) => onChange({ ...seo, noindex: v })}
        path={`${path}.noindex`}
        ctx={ctx}
      />

      <div className="md:col-span-2">
        <p className="mb-2 text-small font-semibold">Aperçu dans Google ({locale.toUpperCase()})</p>
        <div className="max-w-[600px] rounded-control border border-line bg-paper p-4 font-sans">
          <p className="truncate text-[0.8rem] text-pine-700">smarteyecivilengineering.com</p>
          <p className="truncate text-[1.15rem] leading-snug text-pine-700 underline-offset-2">
            {(title || "Titre de la page") + suffix}
          </p>
          <p className="line-clamp-2 text-[0.88rem] text-ink">
            {description || "Ajoutez une description ou un résumé pour qu'elle apparaisse ici."}
          </p>
        </div>
      </div>
    </div>
  );
}
