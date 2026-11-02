"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { listVersions, type Version } from "../lib/data";
import type { CollectionSchema } from "../schema/types";
import { errorMessage, useFeedback } from "./feedback";
import { Spinner, StatusPill } from "./ui";

type Props = {
  open: boolean;
  onClose: () => void;
  schema: CollectionSchema;
  id?: string;
  onRestore: (data: Record<string, unknown>) => void;
};

/** The 25 last saved versions of a document; one can be loaded back into the form. */
export function HistoryDialog({ open, onClose, schema, id, onRestore }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const { notify } = useFeedback();
  const [versions, setVersions] = useState<Version[] | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setVersions(null);
      listVersions(schema, id ?? "")
        .then(setVersions)
        .catch((e) => {
          notify(errorMessage(e), "error");
          setVersions([]);
        });
    }
    if (!open && dialog.open) dialog.close();
  }, [open, schema, id, notify]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="history-title"
      className="m-auto max-h-[85dvh] w-[min(94vw,36rem)] rounded-card border border-line bg-paper p-0 text-ink shadow-lg backdrop:bg-deep/50"
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 id="history-title" className="text-xl">
          Historique des versions
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
      <div className="p-5">
        {versions === null ? (
          <Spinner />
        ) : versions.length === 0 ? (
          <p className="text-pine-700">Aucune version enregistrée pour l&apos;instant.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-line">
            {versions.map((v, i) => (
              <li key={v.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="text-small font-semibold">
                    {v.savedAt ? new Date(v.savedAt).toLocaleString("fr-FR") : "Date inconnue"}
                    {i === 0 ? <span className="label-mono ml-2 text-pine-700">actuelle</span> : null}
                  </p>
                  <p className="text-[0.85rem] text-pine-700">{v.savedBy}</p>
                </div>
                <StatusPill status={v.status} />
                {i > 0 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onRestore(v.data);
                      onClose();
                    }}
                  >
                    Charger
                  </Button>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </dialog>
  );
}
