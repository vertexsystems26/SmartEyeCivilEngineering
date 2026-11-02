"use client";

import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import type { Status, UserDoc } from "@/lib/cms/types";
import { docTitle } from "../schema/helpers";
import type { CollectionSchema } from "../schema/types";
import { revalidate } from "./api";
import { db } from "./firebase";

export type AnyDoc = Record<string, unknown> & { id: string };

const META_KEYS = ["id", "updatedAt", "updatedBy", "publishedAt", "createdAt"] as const;

/** Firestore Timestamps → epoch milliseconds, recursively. */
function plain(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toMillis();
  if (Array.isArray(value)) return value.map(plain);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  }
  return value;
}

function stripMeta(data: Record<string, unknown>) {
  const copy = { ...data };
  for (const key of META_KEYS) delete copy[key];
  return copy;
}

const docRef = (schema: CollectionSchema, id?: string) =>
  schema.singleton ? doc(db, schema.collection) : doc(db, schema.collection, id!);

export async function listDocs(collectionName: string): Promise<AnyDoc[]> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...(plain(d.data()) as Record<string, unknown>) }));
}

export async function getDocument(schema: CollectionSchema, id?: string): Promise<AnyDoc | null> {
  const snap = await getDoc(docRef(schema, id));
  return snap.exists() ? { id: snap.id, ...(plain(snap.data()) as Record<string, unknown>) } : null;
}

/** True if another document of the collection already uses this French slug. */
export async function slugTaken(schema: CollectionSchema, slug: string, selfId?: string) {
  if (schema.singleton || !slug) return false;
  const snap = await getDocs(query(collection(db, schema.collection), where("slug.fr", "==", slug), limit(2)));
  return snap.docs.some((d) => d.id !== selfId);
}

type Actor = { uid: string; email: string };

async function audit(actor: Actor, action: string, schema: CollectionSchema, docId: string, title: string) {
  await addDoc(collection(db, "auditLog"), {
    action,
    collection: schema.collection,
    docId,
    title,
    uid: actor.uid,
    email: actor.email,
    at: serverTimestamp(),
  }).catch((error) => console.warn("Audit log failed", error));
}

export type SaveResult = { id: string; revalidated: boolean };

/**
 * Saves a document, records a version (history / restore) and an audit entry,
 * then refreshes the public pages using it.
 */
export async function saveDocument(
  schema: CollectionSchema,
  id: string | null,
  data: Record<string, unknown>,
  status: Status,
  actor: Actor,
  previousStatus?: Status,
): Promise<SaveResult> {
  const ref = id || schema.singleton ? docRef(schema, id ?? undefined) : doc(collection(db, schema.collection));
  const content = { ...stripMeta(data), status };
  const firstPublish = status === "published" && previousStatus !== "published";

  await setDoc(ref, {
    ...content,
    updatedAt: serverTimestamp(),
    updatedBy: actor.email,
    ...(firstPublish ? { publishedAt: serverTimestamp() } : {}),
  });

  await addDoc(collection(ref, "versions"), {
    data: content,
    status,
    savedAt: serverTimestamp(),
    savedBy: actor.email,
  }).catch((error) => console.warn("Version snapshot failed", error));

  const action = firstPublish
    ? "publish"
    : status === "draft" && previousStatus === "published"
      ? "unpublish"
      : "update";
  await audit(actor, id ? action : "create", schema, ref.id, docTitle(schema, content));

  // Drafts are invisible on the site, unless the document was just unpublished.
  const touchesSite = status === "published" || previousStatus === "published";
  const revalidated = touchesSite ? await revalidate([{ collection: schema.revalidate, id: ref.id }]) : true;
  return { id: ref.id, revalidated };
}

export async function deleteDocument(schema: CollectionSchema, item: AnyDoc, actor: Actor) {
  await deleteDoc(docRef(schema, item.id));
  await audit(actor, "delete", schema, item.id, docTitle(schema, item));
  if (item.status === "published") await revalidate([{ collection: schema.revalidate, id: item.id }]);
}

/** Saves the order of a manually sorted collection in one batch. */
export async function saveOrder(schema: CollectionSchema, ids: string[]) {
  if (!schema.orderField) return;
  const batch = writeBatch(db);
  ids.forEach((id, index) => batch.update(doc(db, schema.collection, id), { [schema.orderField!]: index + 1 }));
  await batch.commit();
  await revalidate([{ collection: schema.revalidate }]);
}

export type Version = { id: string; data: Record<string, unknown>; status: Status; savedAt?: number; savedBy?: string };

export async function listVersions(schema: CollectionSchema, id: string): Promise<Version[]> {
  const snap = await getDocs(query(collection(docRef(schema, id), "versions"), orderBy("savedAt", "desc"), limit(25)));
  return snap.docs.map((d) => ({ id: d.id, ...(plain(d.data()) as Omit<Version, "id">) }));
}

/* ---------- Users ---------- */

export async function listUsers(): Promise<UserDoc[]> {
  return (await listDocs("users")) as unknown as UserDoc[];
}

export async function setUserRole(uid: string, role: UserDoc["role"]) {
  await updateDoc(doc(db, "users", uid), { role });
}

export async function removeUser(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}

export async function listInvitations() {
  return listDocs("invitations");
}

export async function invite(email: string, role: UserDoc["role"], by: string) {
  await setDoc(doc(db, "invitations", email.trim().toLowerCase()), {
    role,
    invitedBy: by,
    createdAt: serverTimestamp(),
  });
}

export async function cancelInvitation(email: string) {
  await deleteDoc(doc(db, "invitations", email));
}
