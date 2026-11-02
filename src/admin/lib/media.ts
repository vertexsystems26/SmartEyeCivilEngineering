"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore/lite";
import type { MediaDoc, MediaRef } from "@/lib/cms/types";
import { deleteStoredFile, revalidate, uploadFile } from "./api";
import { listDocs } from "./data";
import { db } from "./firebase";

export const MODEL_WARN_BYTES = 15 * 1024 * 1024;

export const toRef = (m: MediaDoc): MediaRef => ({
  id: m.id,
  url: m.url,
  ...(m.width ? { width: m.width, height: m.height } : {}),
});

export async function listMedia(): Promise<MediaDoc[]> {
  const items = (await listDocs("media")) as unknown as MediaDoc[];
  return items.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

async function fileHash(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function imageSize(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

export type UploadOutcome = { media: MediaDoc; duplicate: boolean };

/**
 * Uploads one file: duplicate check by content hash, upload to R2 through
 * /api/admin/media, then the `media` document. Alt text starts empty and is
 * flagged on the dashboard until filled in.
 */
export async function uploadMedia(file: File, actorEmail: string): Promise<UploadOutcome> {
  const hash = await fileHash(file);
  const existing = await getDocs(query(collection(db, "media"), where("hash", "==", hash), limit(1)));
  if (!existing.empty) {
    const d = existing.docs[0];
    return { media: { id: d.id, ...(d.data() as Omit<MediaDoc, "id">) }, duplicate: true };
  }

  const [stored, size] = await Promise.all([uploadFile(file), imageSize(file)]);
  const data: Omit<MediaDoc, "id"> = {
    key: stored.key,
    url: stored.url,
    kind: stored.kind,
    filename: file.name,
    contentType: stored.contentType,
    size: stored.size,
    ...(size ?? {}),
    hash: stored.hash,
    alt: { fr: "", en: "" },
    caption: { fr: "", en: "" },
    tags: [],
    createdBy: actorEmail,
  };
  const ref = await addDoc(collection(db, "media"), { ...data, createdAt: serverTimestamp() });
  return { media: { id: ref.id, ...data, createdAt: Date.now() }, duplicate: false };
}

export async function updateMedia(id: string, patch: Partial<Pick<MediaDoc, "alt" | "caption" | "tags">>) {
  await updateDoc(doc(db, "media", id), patch);
  await revalidate([{ collection: "media", id }]);
}

/** Documents that reference a media id ("Où est-il utilisé ?"). */
export async function whereUsed(mediaId: string) {
  const sources = ["projects", "services", "posts", "settings"] as const;
  const hits: { collection: string; id: string; title: string }[] = [];
  for (const name of sources) {
    for (const item of await listDocs(name)) {
      if (JSON.stringify(item).includes(`"id":"${mediaId}"`)) {
        const title = (item.title as { fr?: string } | undefined)?.fr ?? item.id;
        hits.push({ collection: name, id: item.id, title });
      }
    }
  }
  return hits;
}

export async function deleteMedia(media: MediaDoc) {
  await deleteStoredFile(media.key);
  await deleteDoc(doc(db, "media", media.id));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
