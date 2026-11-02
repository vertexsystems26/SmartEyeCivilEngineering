"use client";

import { useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import type { GalleryItem, MediaRef } from "@/lib/cms/types";
import { toRef } from "../../lib/media";
import { MediaPicker } from "../media/media-picker";
import { MediaThumb } from "../media/media-thumb";
import { UploadZone } from "../media/upload-zone";
import { Input } from "../ui";

/** Single image with a focal point (click on the preview to set it). */
export function ImageField({ value, onChange }: { value: MediaRef | null; onChange: (v: MediaRef | null) => void }) {
  const [open, setOpen] = useState(false);

  const setFocal = (e: MouseEvent<HTMLButtonElement>) => {
    if (!value) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    onChange({ ...value, focal: { x, y } });
  };

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={setFocal}
            className="relative w-full max-w-xs overflow-hidden rounded-control border border-line"
            aria-label="Cliquer pour placer le point focal de l'image"
            title="Cliquez pour placer le point focal"
          >
            <MediaThumb url={value.url} focal={value.focal} />
            {value.focal ? (
              <span
                aria-hidden="true"
                className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-pine-600 shadow-md"
                style={{ left: `${value.focal.x}%`, top: `${value.focal.y}%` }}
              />
            ) : null}
          </button>
          <div className="flex gap-2 sm:flex-col">
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
              Remplacer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              Retirer
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" className="self-start" onClick={() => setOpen(true)}>
          Choisir une image…
        </Button>
      )}
      <MediaPicker
        open={open}
        kind="image"
        onClose={() => setOpen(false)}
        onSelect={([m]) => m && onChange(toRef(m))}
      />
    </div>
  );
}

/** 3D model or PDF. */
export function FileField({
  value,
  onChange,
  accept,
}: {
  value: MediaRef | null;
  onChange: (v: MediaRef | null) => void;
  accept: "model" | "document";
}) {
  const [open, setOpen] = useState(false);
  const name = value?.url.split("/").pop();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {value ? (
        <>
          <a href={value.url} target="_blank" rel="noopener" className="link max-w-full truncate text-small">
            {name}
          </a>
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Remplacer
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Retirer
          </Button>
        </>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          {accept === "model" ? "Choisir un modèle 3D…" : "Choisir un document…"}
        </Button>
      )}
      <MediaPicker
        open={open}
        kind={accept}
        onClose={() => setOpen(false)}
        onSelect={([m]) => m && onChange(toRef(m))}
      />
    </div>
  );
}

/** Ordered photo gallery: drop files to add, arrows to reorder, captions per language. */
export function GalleryField({
  value,
  onChange,
  locale,
}: {
  value: GalleryItem[];
  onChange: (v: GalleryItem[]) => void;
  locale: "fr" | "en";
}) {
  const [open, setOpen] = useState(false);
  const items = value ?? [];
  const append = (refs: MediaRef[]) =>
    onChange([...items, ...refs.map((media) => ({ media, caption: { fr: "", en: "" } }))]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.length ? (
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={`${item.media?.id}-${i}`}
              className="flex flex-col overflow-hidden rounded-control border border-line bg-paper"
            >
              {item.media ? <MediaThumb url={item.media.url} /> : null}
              <div className="flex flex-col gap-2 p-2">
                <Input
                  value={item.caption?.[locale] ?? ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...item, caption: { ...item.caption, [locale]: e.target.value } };
                    onChange(next);
                  }}
                  placeholder={`Légende (${locale.toUpperCase()})`}
                  aria-label={`Légende de la photo ${i + 1} (${locale.toUpperCase()})`}
                />
                <div className="flex items-center justify-between">
                  <span className="label-mono text-pine-700">
                    {i + 1}/{items.length}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-11 px-0"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      aria-label={`Avancer la photo ${i + 1}`}
                    >
                      ←
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-11 px-0"
                      onClick={() => move(i, i + 1)}
                      disabled={i === items.length - 1}
                      aria-label={`Reculer la photo ${i + 1}`}
                    >
                      →
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChange(items.filter((_, j) => j !== i))}
                      aria-label={`Retirer la photo ${i + 1}`}
                    >
                      Retirer
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      <UploadZone kind="image" onUploaded={(added) => append(added.map(toRef))} />
      <Button variant="secondary" size="sm" className="self-start" onClick={() => setOpen(true)}>
        Ajouter depuis la médiathèque…
      </Button>
      <MediaPicker
        open={open}
        kind="image"
        multiple
        onClose={() => setOpen(false)}
        onSelect={(list) => append(list.map(toRef))}
      />
    </div>
  );
}
