"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants, Button } from "@/components/ui/button";
import { useProfile } from "../lib/auth";
import { deleteDocument, listDocs, saveOrder, type AnyDoc } from "../lib/data";
import { allFields, docTitle, missingTranslations } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";
import { errorMessage, useFeedback } from "./feedback";
import { EmptyState, Input, Select, Skeleton, StatusPill } from "./ui";

type StatusFilter = "all" | "published" | "draft" | "todo";

export function CollectionList({ schema }: { schema: CollectionSchema }) {
  const { user, profile } = useProfile();
  const { notify, confirm } = useFeedback();
  const [docs, setDocs] = useState<AnyDoc[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    listDocs(schema.collection)
      .then(setDocs)
      .catch((e) => {
        notify(errorMessage(e), "error");
        setDocs([]);
      });
  }, [schema, notify]);

  const fields = useMemo(() => allFields(schema), [schema]);

  const sorted = useMemo(() => {
    const list = [...(docs ?? [])];
    if (schema.orderField) {
      const key = schema.orderField;
      list.sort(
        (a, b) =>
          Number(a[key] ?? 0) - Number(b[key] ?? 0) || docTitle(schema, a).localeCompare(docTitle(schema, b), "fr"),
      );
    } else {
      list.sort((a, b) => Number(b.updatedAt ?? 0) - Number(a.updatedAt ?? 0));
    }
    return list;
  }, [docs, schema]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sorted.filter((d) => {
      if (status === "published" && d.status !== "published") return false;
      if (status === "draft" && d.status === "published") return false;
      if (status === "todo" && !((d.toComplete as string[] | undefined)?.length ?? 0)) return false;
      return !term || JSON.stringify([d.title, d.name, d.summary, d.city]).toLowerCase().includes(term);
    });
  }, [sorted, search, status]);

  const canReorder = Boolean(schema.orderField) && !search && status === "all";

  async function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= sorted.length) return;
    const ids = sorted.map((d) => d.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const key = schema.orderField!;
    setDocs((list) => list?.map((d) => ({ ...d, [key]: ids.indexOf(d.id) + 1 })) ?? list);
    try {
      await saveOrder(schema, ids);
    } catch (error) {
      notify(errorMessage(error), "error");
    }
  }

  async function remove(item: AnyDoc) {
    const ok = await confirm({
      title: `Supprimer « ${docTitle(schema, item)} » ?`,
      message: <p>Cette action est définitive{item.status === "published" ? " et retire le contenu du site" : ""}.</p>,
      confirmLabel: "Supprimer définitivement",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteDocument(schema, item, { uid: user.uid, email: profile.email });
      setDocs((list) => list?.filter((d) => d.id !== item.id) ?? list);
      notify("Supprimé.");
    } catch (error) {
      notify(errorMessage(error), "error");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="text-h2">{schema.labels.plural}</h1>
          <p className="text-pine-700">{schema.description}</p>
        </div>
        <Link href={`/admin/${schema.slug}/nouveau`} className={buttonVariants()}>
          + {schema.labels.newItem}
        </Link>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          aria-label="Rechercher"
          className="sm:max-w-sm"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filtrer par statut"
          className="sm:max-w-56"
        >
          <option value="all">Tous les statuts</option>
          <option value="published">Publiés</option>
          <option value="draft">Brouillons</option>
          <option value="todo">Avec informations à compléter</option>
        </Select>
      </div>

      {docs === null ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState title={docs.length ? "Aucun résultat" : `Aucun ${schema.labels.singular} pour l'instant`}>
          {!docs.length ? (
            <Link href={`/admin/${schema.slug}/nouveau`} className={buttonVariants({ size: "sm" })}>
              {schema.labels.newItem}
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-paper">
          <table className="w-full min-w-[42rem] text-left text-small">
            <thead className="border-b border-line bg-sand-100">
              <tr className="label-mono text-pine-700">
                {canReorder ? <th className="w-24 px-3 py-3">Ordre</th> : null}
                <th className="px-3 py-3">Titre</th>
                {schema.columns?.map((c) => (
                  <th key={c.label} className="px-3 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-3 py-3">Statut</th>
                <th className="px-3 py-3">Modifié</th>
                <th className="px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((d) => {
                const index = sorted.indexOf(d);
                const todo = (d.toComplete as string[] | undefined)?.length ?? 0;
                const missingEn = missingTranslations(fields, d).length;
                return (
                  <tr key={d.id} className="hover:bg-sand-100/60">
                    {canReorder ? (
                      <td className="px-2 py-2">
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-10 px-0"
                            onClick={() => move(index, -1)}
                            disabled={index === 0}
                            aria-label={`Monter ${docTitle(schema, d)}`}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-10 px-0"
                            onClick={() => move(index, 1)}
                            disabled={index === sorted.length - 1}
                            aria-label={`Descendre ${docTitle(schema, d)}`}
                          >
                            ↓
                          </Button>
                        </div>
                      </td>
                    ) : null}
                    <td className="max-w-md px-3 py-3">
                      <Link
                        href={`/admin/${schema.slug}/${d.id}`}
                        className="font-semibold text-ink underline-offset-4 hover:underline"
                      >
                        {docTitle(schema, d)}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {todo ? <span className="label-mono text-pine-700">{todo} à compléter</span> : null}
                        {missingEn ? (
                          <span className="label-mono text-pine-700">EN : {missingEn} manquant(s)</span>
                        ) : null}
                      </div>
                    </td>
                    {schema.columns?.map((c) => (
                      <td key={c.label} className="px-3 py-3 text-pine-700">
                        {c.value(d)}
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <StatusPill status={d.status} />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-pine-700">
                      {d.updatedAt ? new Date(Number(d.updatedAt)).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(d)}
                        aria-label={`Supprimer ${docTitle(schema, d)}`}
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
