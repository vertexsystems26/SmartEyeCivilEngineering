"use client";

import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore/lite";
import * as seed from "@/seed/data";
import { revalidate } from "./api";
import { db } from "./firebase";

export type SeedReport = { created: number; skipped: number };

/**
 * Imports the reference data from the brief (services, projects, categories,
 * six empty article drafts, About page). Existing documents are never
 * overwritten, so running it twice is harmless.
 */
export async function importSeed(actorEmail: string): Promise<SeedReport> {
  const items: { path: string; data: Record<string, unknown> }[] = [
    ...seed.categories.map((c) => ({ path: `categories/${c.id}`, data: c.data })),
    ...seed.services.map((s) => ({ path: `services/${s.id}`, data: s.data })),
    ...seed.projects.map((p) => ({ path: `projects/${p.id}`, data: p.data })),
    ...seed.posts.map((p) => ({ path: `posts/${p.id}`, data: p.data })),
    { path: "settings/about", data: seed.about },
  ];

  const existing = await Promise.all(items.map((item) => getDoc(doc(db, item.path)).then((s) => s.exists())));
  const toCreate = items.filter((_, i) => !existing[i]);

  // Firestore batches hold up to 500 writes.
  for (let i = 0; i < toCreate.length; i += 400) {
    const batch = writeBatch(db);
    for (const item of toCreate.slice(i, i + 400)) {
      batch.set(doc(db, item.path), {
        ...item.data,
        updatedAt: serverTimestamp(),
        updatedBy: actorEmail,
        ...(item.data.status === "published" ? { publishedAt: serverTimestamp() } : {}),
      });
    }
    await batch.commit();
  }

  if (toCreate.length) {
    await revalidate([
      { collection: "categories" },
      { collection: "services" },
      { collection: "projects" },
      { collection: "posts" },
      { collection: "settings" },
    ]);
  }
  return { created: toCreate.length, skipped: items.length - toCreate.length };
}
