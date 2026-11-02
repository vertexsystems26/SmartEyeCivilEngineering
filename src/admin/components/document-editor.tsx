"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Status } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";
import { useProfile } from "../lib/auth";
import { deleteDocument, getDocument, saveDocument, slugTaken, type AnyDoc } from "../lib/data";
import { invalidateRelationCache } from "./fields/relation-field";
import { allFields, docTitle, missingTranslations, slugify, validate } from "../schema/helpers";
import type { CollectionSchema, FieldDef } from "../schema/types";
import { errorMessage, useFeedback } from "./feedback";
import { FieldRenderer } from "./fields/field-renderer";
import { HistoryDialog } from "./history-dialog";
import { Spinner, StatusPill } from "./ui";

type Props = { schema: CollectionSchema; id?: string };

const draftKey = (schema: CollectionSchema, id: string) => `sece-admin-draft:${schema.collection}:${id}`;

function readLocalDraft(key: string): { savedAt: number; data: Record<string, unknown> } | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** When the title changes, keep the slug in sync until someone edits it by hand. */
function syncSlugs(fields: FieldDef[], data: Record<string, unknown>, changed: string, previous: unknown) {
  const next = { ...data };
  for (const field of fields) {
    if (field.type !== "slug" || field.from !== changed) continue;
    const slug = { ...((next[field.name] as Record<string, string>) ?? { fr: "", en: "" }) };
    const before = (previous ?? {}) as Record<string, string>;
    const after = (next[changed] ?? {}) as Record<string, string>;
    for (const loc of ["fr", "en"] as const) {
      if (!slug[loc] || slug[loc] === slugify(before[loc] ?? "")) slug[loc] = slugify(after[loc] ?? "");
    }
    next[field.name] = slug;
  }
  return next;
}

export function DocumentEditor({ schema, id }: Props) {
  const router = useRouter();
  const { user, profile } = useProfile();
  const { notify, confirm } = useFeedback();
  const isNew = !schema.singleton && (!id || id === "nouveau");
  const actor = { uid: user.uid, email: profile.email };

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [original, setOriginal] = useState<string>("");
  const [loadedDoc, setLoadedDoc] = useState<AnyDoc | null>(null);
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [localDraft, setLocalDraft] = useState<{ savedAt: number; data: Record<string, unknown> } | null>(null);
  const storageKey = draftKey(schema, isNew ? "nouveau" : (id ?? "singleton"));

  // Load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const doc = isNew ? null : await getDocument(schema, id);
        if (!active) return;
        if (!isNew && !doc && !schema.singleton) {
          notify("Ce contenu n'existe plus.", "error");
          router.replace(`/admin/${schema.slug}`);
          return;
        }
        const initial = { ...schema.defaults(), ...(doc ?? {}) };
        setLoadedDoc(doc);
        setData(initial);
        setOriginal(JSON.stringify(initial));
        const local = readLocalDraft(storageKey);
        if (
          local &&
          local.savedAt > Number(doc?.updatedAt ?? 0) &&
          JSON.stringify(local.data) !== JSON.stringify(initial)
        ) {
          setLocalDraft(local);
        }
      } catch (error) {
        notify(errorMessage(error), "error");
      }
    })();
    return () => {
      active = false;
    };
  }, [schema, id, isNew, notify, router, storageKey]);

  const dirty = data !== null && JSON.stringify(data) !== original;

  // Local autosave (brief §7.5) + leave-page warning
  useEffect(() => {
    if (!dirty || !data) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), data }));
      } catch {
        /* storage full or disabled: the warning on leave still protects the user */
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [data, dirty, storageKey]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const fields = useMemo(() => allFields(schema), [schema]);
  const setField = useCallback(
    (name: string, value: unknown) =>
      setData((prev) => (prev ? syncSlugs(fields, { ...prev, [name]: value }, name, prev[name]) : prev)),
    [fields],
  );

  if (!data) return <Spinner />;

  const status = (data.status as Status) ?? "draft";
  const previousStatus = (loadedDoc?.status as Status | undefined) ?? undefined;
  const title = schema.singleton ? schema.labels.plural : isNew ? schema.labels.newItem : docTitle(schema, data);
  const missing = missingTranslations(fields, data);
  const toComplete = (data.toComplete as string[] | undefined) ?? [];
  const publicPath = schema.publicPath?.(data, locale);

  async function save(nextStatus: Status) {
    if (!data) return;
    const issues = validate(fields, data);
    if (issues.length) {
      setErrors(Object.fromEntries(issues.map((i) => [i.path, i.message])));
      const firstTab = schema.tabs.findIndex((t) => t.fields.some((f) => issues[0].path.startsWith(f.name)));
      if (firstTab >= 0) setTab(firstTab);
      setLocale("fr");
      notify(`${issues.length} champ(s) obligatoire(s) à remplir : ${issues.map((i) => i.label).join(", ")}.`, "error");
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const slug = (data.slug as { fr?: string } | undefined)?.fr;
      if (slug && (await slugTaken(schema, slug, isNew ? undefined : id))) {
        setErrors({ slug: "Cette adresse est déjà utilisée par un autre contenu." });
        setTab(0);
        notify("L'adresse de la page est déjà utilisée : modifiez-la.", "error");
        return;
      }
      const result = await saveDocument(schema, isNew ? null : (id ?? null), data, nextStatus, actor, previousStatus);
      const saved = { ...data, status: nextStatus };
      setData(saved);
      setOriginal(JSON.stringify(saved));
      setLoadedDoc({ ...(loadedDoc ?? { id: result.id }), ...saved, id: result.id });
      localStorage.removeItem(storageKey);
      invalidateRelationCache(schema.collection);

      const message =
        nextStatus === "published"
          ? result.revalidated
            ? "Publié : le site est à jour."
            : "Publié. La mise à jour du site a échoué, elle se fera au prochain enregistrement."
          : previousStatus === "published"
            ? "Retiré du site, enregistré comme brouillon."
            : "Brouillon enregistré.";
      notify(message, result.revalidated ? "success" : "info");
      if (isNew) router.replace(`/admin/${schema.slug}/${result.id}`);
    } catch (error) {
      notify(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!loadedDoc) return;
    const ok = await confirm({
      title: `Supprimer ${schema.labels.feminine ? "cette" : "ce"} ${schema.labels.singular} ?`,
      message: (
        <p>
          « {title} » sera supprimé définitivement{status === "published" ? " et retiré du site" : ""}. Les fichiers de
          la médiathèque sont conservés.
        </p>
      ),
      confirmLabel: "Supprimer définitivement",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteDocument(schema, loadedDoc, actor);
      localStorage.removeItem(storageKey);
      notify("Supprimé.");
      router.replace(`/admin/${schema.slug}`);
    } catch (error) {
      notify(errorMessage(error), "error");
      setBusy(false);
    }
  }

  async function duplicate() {
    if (!data) return;
    if (
      dirty &&
      !(await confirm({
        title: "Modifications non enregistrées",
        message: "La copie reprendra la dernière version enregistrée.",
        confirmLabel: "Continuer",
      }))
    )
      return;
    setBusy(true);
    try {
      const source = JSON.parse(original) as Record<string, unknown>;
      const copy: Record<string, unknown> = { ...source, status: "draft" };
      const t = copy[schema.titleField] as { fr: string; en: string } | undefined;
      if (t) copy[schema.titleField] = { fr: `${t.fr} (copie)`, en: t.en ? `${t.en} (copy)` : "" };
      if (copy.slug) {
        const s = copy.slug as { fr: string; en: string };
        copy.slug = { fr: `${s.fr}-copie`, en: s.en ? `${s.en}-copy` : "" };
      }
      const result = await saveDocument(schema, null, copy, "draft", actor);
      notify("Copie créée en brouillon.");
      router.push(`/admin/${schema.slug}/${result.id}`);
    } catch (error) {
      notify(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  }

  const currentFields = schema.tabs[tab]?.fields ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-3 border-b border-line bg-sand-100/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {!schema.singleton ? (
            <Link href={`/admin/${schema.slug}`} className="label-mono text-pine-700 hover:text-ink">
              ← {schema.labels.plural}
            </Link>
          ) : null}
          <h1 className="min-w-0 flex-1 truncate text-[1.6rem]">{title}</h1>
          <StatusPill status={status} />
          {dirty ? <span className="label-mono text-pine-700">Modifications non enregistrées</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Langue d'édition"
            className="flex rounded-control border border-sage-300 bg-paper p-1"
          >
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={locale === l}
                onClick={() => setLocale(l)}
                className={cn(
                  "label-mono min-h-9 rounded-[8px] px-3",
                  locale === l ? "bg-ink text-paper" : "text-ink hover:bg-mist-200",
                )}
              >
                {l === "fr" ? "Français" : `English${missing.length ? ` · ${missing.length}` : ""}`}
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {publicPath && previousStatus === "published" ? (
              <a
                href={publicPath}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center px-3 text-small font-semibold text-pine-700 underline hover:text-ink"
              >
                Voir sur le site ↗
              </a>
            ) : null}
            {!isNew ? (
              <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(true)} disabled={busy}>
                Historique
              </Button>
            ) : null}
            {status === "published" && !schema.singleton ? (
              <Button variant="secondary" size="sm" onClick={() => save("draft")} disabled={busy}>
                Dépublier
              </Button>
            ) : null}
            {status !== "published" ? (
              <Button variant="secondary" size="sm" onClick={() => save("draft")} disabled={busy}>
                Enregistrer le brouillon
              </Button>
            ) : null}
            <Button size="sm" onClick={() => save("published")} disabled={busy || (!dirty && status === "published")}>
              {busy ? "Enregistrement…" : status === "published" ? "Mettre à jour le site" : "Publier"}
            </Button>
          </div>
        </div>
      </div>

      {localDraft ? (
        <div
          role="status"
          className="flex flex-wrap items-center gap-3 rounded-card border border-pine-600 bg-paper p-4"
        >
          <p className="flex-1 text-small">
            Des modifications non enregistrées du {new Date(localDraft.savedAt).toLocaleString("fr-FR")} ont été
            retrouvées sur cet ordinateur.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setData(localDraft.data);
              setLocalDraft(null);
            }}
          >
            Les récupérer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem(storageKey);
              setLocalDraft(null);
            }}
          >
            Ignorer
          </Button>
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Tabs */}
          <div role="tablist" aria-label="Sections" className="flex gap-1 overflow-x-auto border-b border-line">
            {schema.tabs.map((t, i) => (
              <button
                key={t.label}
                role="tab"
                id={`tab-${i}`}
                aria-selected={tab === i}
                aria-controls="tabpanel"
                onClick={() => setTab(i)}
                className={cn(
                  "-mb-px min-h-11 border-b-2 px-4 text-small font-semibold whitespace-nowrap",
                  tab === i ? "border-pine-600 text-ink" : "border-transparent text-pine-700 hover:text-ink",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div id="tabpanel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="grid gap-6 md:grid-cols-2">
            {currentFields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={data[field.name]}
                onChange={(v) => setField(field.name, v)}
                path={field.name}
                ctx={{ locale, errors, docId: isNew ? undefined : id, root: data }}
              />
            ))}
          </div>
        </div>

        {/* Side panel */}
        <aside className="flex flex-col gap-4 xl:sticky xl:top-40 xl:self-start">
          {toComplete.length ? (
            <section className="rounded-card border border-pine-600 bg-paper p-4">
              <h2 className="label-mono mb-2 text-pine-700">À compléter</h2>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-small">
                {toComplete.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="rounded-card border border-line bg-paper p-4">
            <h2 className="label-mono mb-2 text-pine-700">Traduction anglaise</h2>
            {missing.length ? (
              <>
                <p className="mb-2 text-small">{missing.length} champ(s) remplis en français mais pas en anglais :</p>
                <ul className="flex list-disc flex-col gap-0.5 pl-5 text-[0.85rem]">
                  {missing.slice(0, 12).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => setLocale("en")}>
                  Passer en anglais
                </Button>
              </>
            ) : (
              <p className="text-small">Complète ✓</p>
            )}
          </section>
          {loadedDoc?.updatedAt ? (
            <p className="label-mono px-1 text-pine-700">
              Modifié le {new Date(Number(loadedDoc.updatedAt)).toLocaleString("fr-FR")}
              {loadedDoc.updatedBy ? ` par ${String(loadedDoc.updatedBy)}` : ""}
            </p>
          ) : null}
          {!isNew && !schema.singleton ? (
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <Button variant="ghost" size="sm" onClick={duplicate} disabled={busy}>
                Dupliquer
              </Button>
              <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
                Supprimer…
              </Button>
            </div>
          ) : null}
        </aside>
      </div>

      {!isNew ? (
        <HistoryDialog
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          schema={schema}
          id={id}
          onRestore={(restored) => {
            setData({ ...schema.defaults(), ...restored, status });
            notify("Version chargée : vérifiez-la puis enregistrez pour la rétablir.", "info");
          }}
        />
      ) : null}
    </div>
  );
}
