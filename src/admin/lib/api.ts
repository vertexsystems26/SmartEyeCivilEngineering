"use client";

import type { RevalidatableCollection } from "@/lib/cms/collections";
import type { MediaKind } from "@/lib/cms/types";
import { auth } from "./firebase";

/** fetch() to our /api/admin routes with the current user's ID token. */
async function authedFetch(input: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Session expirée : reconnectez-vous.");
  const res = await fetch(input, { ...init, headers: { ...init.headers, authorization: `Bearer ${token}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? `Erreur ${res.status}`);
  return body;
}

export type UploadResult = {
  key: string;
  url: string;
  kind: MediaKind;
  contentType: string;
  size: number;
  hash: string;
};

export function uploadFile(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  return authedFetch("/api/admin/media", { method: "POST", body: form });
}

export function deleteStoredFile(key: string) {
  return authedFetch(`/api/admin/media?key=${encodeURIComponent(key)}`, { method: "DELETE" });
}

/** Refreshes the public pages that use this content. Failures are reported, never fatal. */
export async function revalidate(targets: { collection: RevalidatableCollection; id?: string }[]) {
  try {
    await authedFetch("/api/admin/revalidate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targets }),
    });
    return true;
  } catch (error) {
    console.warn("Revalidation failed", error);
    return false;
  }
}
