"use client";

import { useRef, useState, type DragEvent } from "react";
import type { MediaDoc, MediaKind } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";
import { useProfile } from "../../lib/auth";
import { MODEL_WARN_BYTES, formatBytes, uploadMedia } from "../../lib/media";
import { errorMessage, useFeedback } from "../feedback";

const ACCEPT: Record<MediaKind | "all", string> = {
  image: ".jpg,.jpeg,.png,.webp,.avif",
  model: ".glb,.gltf",
  document: ".pdf",
  all: ".jpg,.jpeg,.png,.webp,.avif,.glb,.gltf,.pdf",
};

const HINT: Record<MediaKind | "all", string> = {
  image: "JPG, PNG, WebP ou AVIF · 20 Mo max. Les tailles adaptées aux écrans sont générées automatiquement.",
  model: "GLB recommandé (ou glTF) · alerte au-delà de 15 Mo, 30 Mo max.",
  document: "PDF · 20 Mo max.",
  all: "Images (JPG, PNG, WebP, AVIF), modèles 3D (GLB, glTF), PDF.",
};

/** Drag-and-drop / click upload of one or several files, uploaded one after the other. */
export function UploadZone({
  kind = "all",
  onUploaded,
}: {
  kind?: MediaKind | "all";
  onUploaded: (items: MediaDoc[]) => void;
}) {
  const { profile } = useProfile();
  const { notify } = useFeedback();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(null);

  async function handle(files: FileList | File[]) {
    const list = [...files];
    if (!list.length) return;
    const uploaded: MediaDoc[] = [];
    for (const [index, file] of list.entries()) {
      setProgress({ done: index, total: list.length, current: file.name });
      if (/\.(glb|gltf)$/i.test(file.name) && file.size > MODEL_WARN_BYTES) {
        notify(`${file.name} pèse ${formatBytes(file.size)} : pensez à l'optimiser (voir Aide).`, "info");
      }
      try {
        const { media, duplicate } = await uploadMedia(file, profile.email);
        if (duplicate)
          notify(`${file.name} existe déjà dans la médiathèque : le fichier existant est réutilisé.`, "info");
        uploaded.push(media);
      } catch (error) {
        notify(`${file.name} : ${errorMessage(error)}`, "error");
      }
    }
    setProgress(null);
    if (uploaded.length) {
      notify(uploaded.length === 1 ? "Fichier ajouté." : `${uploaded.length} fichiers ajoutés.`);
      onUploaded(uploaded);
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handle(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors",
        dragging ? "border-pine-600 bg-mist-200" : "border-sage-300 bg-sand-100",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT[kind]}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files) void handle(e.target.files);
          e.target.value = "";
        }}
      />
      {progress ? (
        <div role="status" className="flex w-full max-w-sm flex-col gap-2">
          <p className="text-small">
            Envoi {progress.done + 1}/{progress.total} : <span className="font-semibold">{progress.current}</span>
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-mist-200">
            <div
              className="h-full bg-pine-600 transition-[width]"
              style={{ width: `${((progress.done + 0.5) / progress.total) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-small">
            Glissez-déposez vos fichiers ici ou{" "}
            <button type="button" onClick={() => inputRef.current?.click()} className="link font-semibold">
              parcourez votre ordinateur
            </button>
          </p>
          <p className="text-[0.8rem] text-pine-700">{HINT[kind]}</p>
        </>
      )}
    </div>
  );
}
