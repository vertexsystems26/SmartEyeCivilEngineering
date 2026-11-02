"use client";

import { useEffect, useState } from "react";
import { listDocs, type AnyDoc } from "../../lib/data";
import { localizedText } from "../../schema/helpers";
import { Select } from "../ui";

// One fetch per collection per page load, shared by every relation field.
const cache = new Map<string, Promise<AnyDoc[]>>();
const load = (collection: string) => {
  if (!cache.has(collection))
    cache.set(
      collection,
      listDocs(collection).catch(() => []),
    );
  return cache.get(collection)!;
};
export const invalidateRelationCache = (collection: string) => cache.delete(collection);

const label = (d: AnyDoc) => localizedText(d.title) || localizedText(d.name) || d.id;

type Props = {
  id: string;
  collection: string;
  many?: boolean;
  filter?: Record<string, string>;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  describedBy?: string;
  excludeId?: string;
};

export function RelationField({ id, collection, many, filter, value, onChange, describedBy, excludeId }: Props) {
  const [options, setOptions] = useState<AnyDoc[] | null>(null);

  useEffect(() => {
    let active = true;
    void load(collection).then((docs) => {
      if (!active) return;
      const filtered = docs
        .filter((d) => d.id !== excludeId)
        .filter((d) => Object.entries(filter ?? {}).every(([k, v]) => d[k] === v))
        .sort((a, b) => label(a).localeCompare(label(b), "fr"));
      setOptions(filtered);
    });
    return () => {
      active = false;
    };
  }, [collection, filter, excludeId]);

  if (options === null) return <p className="text-small text-pine-700">Chargement…</p>;
  if (!options.length) return <p className="text-small text-pine-700">Aucun élément disponible pour l&apos;instant.</p>;

  if (!many) {
    return (
      <Select
        id={id}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={describedBy}
      >
        <option value="">— Aucune —</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {label(o)}
          </option>
        ))}
      </Select>
    );
  }

  const selected = new Set((value as string[]) ?? []);
  return (
    <ul
      id={id}
      aria-describedby={describedBy}
      className="grid max-h-64 gap-1 overflow-y-auto rounded-control border border-sage-300 bg-paper p-2 sm:grid-cols-2"
    >
      {options.map((o) => (
        <li key={o.id}>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-[8px] px-2 hover:bg-sand-100">
            <input
              type="checkbox"
              className="size-4 accent-pine-600"
              checked={selected.has(o.id)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(o.id);
                else next.delete(o.id);
                onChange([...next]);
              }}
            />
            <span className="text-small">{label(o)}</span>
            {o.status !== "published" ? <span className="label-mono text-pine-700">brouillon</span> : null}
          </label>
        </li>
      ))}
    </ul>
  );
}
