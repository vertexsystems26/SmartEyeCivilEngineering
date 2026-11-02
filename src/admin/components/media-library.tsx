"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { MediaDoc } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";
import { deleteMedia, formatBytes, listMedia, updateMedia, whereUsed } from "../lib/media";
import { schemaByCollection } from "../schemas";
import { errorMessage, useFeedback } from "./feedback";
import { TagsInput } from "./fields/tags-input";
import { MediaThumb } from "./media/media-thumb";
import { UploadZone } from "./media/upload-zone";
import { FieldShell, Input, Select, Skeleton, Textarea } from "./ui";

type Filter = "all" | "image" | "model" | "document" | "noalt";

export function MediaLibrary() {
  const { notify } = useFeedback();
  const [items, setItems] = useState<MediaDoc[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    listMedia()
      .then(setItems)
      .catch((e) => {
        notify(errorMessage(e), "error");
        setItems([]);
      });
  }, [notify]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (items ?? []).filter((m) => {
      if (filter === "noalt") return m.kind === "image" && !m.alt?.fr;
      if (filter !== "all" && m.kind !== filter) return false;
      return !term || `${m.filename} ${m.alt?.fr} ${m.tags?.join(" ")}`.toLowerCase().includes(term);
    });
  }, [items, filter, search]);

  const selected = items?.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Médiathèque</h1>
        <p className="measure text-pine-700">
          Images, modèles 3D et documents du site. Chaque image doit avoir un texte alternatif : il décrit l&apos;image
          aux personnes malvoyantes et aide le référencement.
        </p>
      </header>

      <UploadZone
        onUploaded={(added) =>
          setItems((list) => [...added, ...(list ?? []).filter((m) => !added.some((a) => a.id === m.id))])
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          placeholder="Rechercher…"
          aria-label="Rechercher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          aria-label="Filtrer"
          className="sm:max-w-64"
        >
          <option value="all">Tous les fichiers</option>
          <option value="image">Images</option>
          <option value="model">Modèles 3D</option>
          <option value="document">Documents</option>
          <option value="noalt">Images sans texte alternatif</option>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {items === null ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="aspect-[4/3]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-pine-700">Aucun fichier.</p>
        ) : (
          <ul className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  aria-pressed={selectedId === m.id}
                  className={cn(
                    "flex w-full flex-col overflow-hidden rounded-control border-2 bg-paper text-left",
                    selectedId === m.id ? "border-pine-600" : "border-transparent hover:border-sage-300",
                  )}
                >
                  <MediaThumb url={m.url} kind={m.kind} />
                  <span className="truncate px-2 pt-1.5 text-[0.8rem]">{m.filename}</span>
                  <span className="label-mono px-2 pb-1.5 text-pine-700">
                    {m.kind === "image" && !m.alt?.fr ? "⚠ sans texte alt." : formatBytes(m.size)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected ? (
          <MediaDetails
            key={selected.id}
            media={selected}
            onSaved={(next) => setItems((list) => list?.map((m) => (m.id === next.id ? next : m)) ?? list)}
            onDeleted={(id) => {
              setItems((list) => list?.filter((m) => m.id !== id) ?? list);
              setSelectedId(null);
            }}
          />
        ) : (
          <p className="hidden rounded-card border border-dashed border-sage-300 p-6 text-small text-pine-700 lg:block">
            Sélectionnez un fichier pour modifier son texte alternatif, sa légende et ses tags.
          </p>
        )}
      </div>
    </div>
  );
}

function MediaDetails({
  media,
  onSaved,
  onDeleted,
}: {
  media: MediaDoc;
  onSaved: (m: MediaDoc) => void;
  onDeleted: (id: string) => void;
}) {
  const { notify, confirm } = useFeedback();
  const [alt, setAlt] = useState(media.alt ?? { fr: "", en: "" });
  const [caption, setCaption] = useState(media.caption ?? { fr: "", en: "" });
  const [tags, setTags] = useState(media.tags ?? []);
  const [busy, setBusy] = useState(false);
  const [usage, setUsage] = useState<{ collection: string; id: string; title: string }[] | null>(null);

  const dirty = JSON.stringify([alt, caption, tags]) !== JSON.stringify([media.alt, media.caption, media.tags]);

  async function save() {
    setBusy(true);
    try {
      await updateMedia(media.id, { alt, caption, tags });
      onSaved({ ...media, alt, caption, tags });
      notify("Fichier mis à jour.");
    } catch (error) {
      notify(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    const used = await whereUsed(media.id).catch(() => []);
    setBusy(false);
    if (used.length) {
      setUsage(used);
      notify("Ce fichier est utilisé : retirez-le de ces contenus avant de le supprimer.", "error");
      return;
    }
    const ok = await confirm({
      title: "Supprimer ce fichier ?",
      message: <p>{media.filename} sera supprimé définitivement.</p>,
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteMedia(media);
      onDeleted(media.id);
      notify("Fichier supprimé.");
    } catch (error) {
      notify(errorMessage(error), "error");
      setBusy(false);
    }
  }

  const adminHref = (collection: string, id: string) => {
    const schema = schemaByCollection(collection === "settings" ? `settings/${id}` : collection);
    if (!schema) return null;
    return schema.singleton ? `/admin/${schema.slug}` : `/admin/${schema.slug}/${id}`;
  };

  return (
    <aside className="flex flex-col gap-4 self-start rounded-card border border-line bg-paper p-5 lg:sticky lg:top-6">
      <MediaThumb url={media.url} kind={media.kind} className="rounded-control" alt="" />
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.85rem]">
        <dt className="text-pine-700">Fichier</dt>
        <dd className="truncate">{media.filename}</dd>
        <dt className="text-pine-700">Poids</dt>
        <dd>{formatBytes(media.size)}</dd>
        {media.width ? (
          <>
            <dt className="text-pine-700">Dimensions</dt>
            <dd>
              {media.width} × {media.height} px
            </dd>
          </>
        ) : null}
        <dt className="text-pine-700">Adresse</dt>
        <dd className="truncate">
          <a href={media.url} target="_blank" rel="noopener" className="link">
            {media.url}
          </a>
        </dd>
      </dl>

      {media.kind === "image" ? (
        <>
          <FieldShell
            id="alt-fr"
            label="Texte alternatif (FR)"
            required
            description="Décrivez ce que montre l'image, par exemple « Coulage de la dalle du 3e étage »."
          >
            <Textarea
              id="alt-fr"
              rows={2}
              value={alt.fr}
              onChange={(e) => setAlt({ ...alt, fr: e.target.value })}
              aria-describedby="alt-fr-desc"
            />
          </FieldShell>
          <FieldShell id="alt-en" label="Texte alternatif (EN)">
            <Textarea id="alt-en" rows={2} value={alt.en} onChange={(e) => setAlt({ ...alt, en: e.target.value })} />
          </FieldShell>
          <FieldShell id="cap-fr" label="Légende (FR)">
            <Input id="cap-fr" value={caption.fr} onChange={(e) => setCaption({ ...caption, fr: e.target.value })} />
          </FieldShell>
          <FieldShell id="cap-en" label="Légende (EN)">
            <Input id="cap-en" value={caption.en} onChange={(e) => setCaption({ ...caption, en: e.target.value })} />
          </FieldShell>
        </>
      ) : null}
      <FieldShell id="media-tags" label="Tags">
        <TagsInput id="media-tags" value={tags} onChange={setTags} />
      </FieldShell>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save} disabled={busy || !dirty}>
          Enregistrer
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={async () => setUsage(await whereUsed(media.id).catch(() => []))}
        >
          Où est-il utilisé ?
        </Button>
        <Button variant="ghost" size="sm" onClick={remove} disabled={busy} className="ml-auto">
          Supprimer
        </Button>
      </div>

      {usage ? (
        usage.length ? (
          <ul className="flex flex-col gap-1 border-t border-line pt-3 text-small">
            {usage.map((u) => {
              const href = adminHref(u.collection, u.id);
              return (
                <li key={`${u.collection}-${u.id}`}>
                  {href ? (
                    <Link href={href} className="link">
                      {u.title}
                    </Link>
                  ) : (
                    u.title
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="border-t border-line pt-3 text-small">Utilisé nulle part.</p>
        )
      ) : null}
    </aside>
  );
}
