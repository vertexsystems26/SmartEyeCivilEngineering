"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import type { MediaDoc, MediaKind } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";
import { listMedia } from "../../lib/media";
import { errorMessage, useFeedback } from "../feedback";
import { Input, Spinner } from "../ui";
import { MediaThumb } from "./media-thumb";
import { UploadZone } from "./upload-zone";

type Props = {
  open: boolean;
  kind: MediaKind;
  multiple?: boolean;
  onClose: () => void;
  onSelect: (items: MediaDoc[]) => void;
};

/** Modal media library: search, upload, select one or several files. */
export function MediaPicker({ open, kind, multiple = false, onClose, onSelect }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { notify } = useFeedback();
  const [items, setItems] = useState<MediaDoc[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      listMedia()
        .then(setItems)
        .catch((e) => notify(errorMessage(e), "error"));
    }
    if (!open && dialog.open) dialog.close();
  }, [open, notify]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (items ?? [])
      .filter((m) => m.kind === kind)
      .filter((m) => !term || `${m.filename} ${m.alt.fr} ${m.tags.join(" ")}`.toLowerCase().includes(term));
  }, [items, kind, search]);

  const toggle = (id: string) => {
    if (!multiple) return setSelected([id]);
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const finish = (chosen: MediaDoc[]) => {
    onSelect(chosen);
    setSelected([]);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="picker-title"
      className="m-auto h-[min(90dvh,52rem)] w-[min(96vw,64rem)] rounded-large border border-line bg-paper p-0 text-ink shadow-lg backdrop:bg-deep/50"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
          <h2 id="picker-title" className="text-xl">
            {kind === "image" ? "Choisir une image" : kind === "model" ? "Choisir un modèle 3D" : "Choisir un document"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-control hover:bg-mist-200"
            aria-label="Fermer"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex flex-col gap-4 overflow-y-auto p-5">
          <UploadZone
            kind={kind}
            onUploaded={(added) => {
              setItems((list) => [...added, ...(list ?? []).filter((m) => !added.some((a) => a.id === m.id))]);
              if (!multiple && added.length === 1) finish(added);
              else setSelected((s) => [...new Set([...s, ...added.map((a) => a.id)])]);
            }}
          />
          <Input
            type="search"
            placeholder="Rechercher (nom, texte alternatif, tag)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher dans la médiathèque"
          />

          {items === null ? (
            <Spinner />
          ) : visible.length === 0 ? (
            <p className="py-8 text-center text-pine-700">Aucun fichier. Ajoutez-en avec la zone ci-dessus.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visible.map((m) => {
                const isSelected = selected.includes(m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      onDoubleClick={() => finish([m])}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full flex-col overflow-hidden rounded-control border-2 bg-paper text-left transition-colors",
                        isSelected ? "border-pine-600" : "border-transparent hover:border-sage-300",
                      )}
                    >
                      <MediaThumb url={m.url} kind={m.kind} alt="" />
                      <span className="truncate px-2 py-1.5 text-[0.8rem]">{m.filename}</span>
                      {m.kind === "image" && !m.alt.fr ? (
                        <span className="label-mono px-2 pb-1.5 text-pine-700">Sans texte alternatif</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="mt-auto flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <p className="text-small text-pine-700">
            {selected.length ? `${selected.length} sélectionné(s)` : "Cliquez pour sélectionner"}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={!selected.length}
              onClick={() => finish((items ?? []).filter((m) => selected.includes(m.id)))}
            >
              Utiliser
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
