import "server-only";
import { firebaseConfig } from "@/lib/firebase/config";

/*
 * Minimal Firestore REST client for the server. Public pages read without
 * credentials (rules expose published content only); back-office routes pass
 * the caller's ID token so their own permissions apply.
 */

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { referenceValue: string }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } };

type FirestoreDocument = { name: string; fields?: Record<string, FirestoreValue>; updateTime?: string };

const base = () =>
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

function decodeValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return Date.parse(value.timestampValue);
  if ("stringValue" in value) return value.stringValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("mapValue" in value) return decodeFields(value.mapValue.fields);
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decodeValue);
  return null;
}

function decodeFields(fields: Record<string, FirestoreValue> = {}) {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeValue(v)]));
}

function decodeDocument<T>(doc: FirestoreDocument): T {
  const id = doc.name.split("/").pop() ?? "";
  return { id, ...decodeFields(doc.fields) } as T;
}

type Options = { idToken?: string };

function headers({ idToken }: Options) {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (idToken) h.authorization = `Bearer ${idToken}`;
  return h;
}

function keyParam(opts: Options) {
  return opts.idToken ? "" : `?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
}

/** Reads one document ("collection/id"); null when missing or not readable. */
export async function getDocument<T>(path: string, opts: Options = {}): Promise<T | null> {
  const res = await fetch(`${base()}/${path}${keyParam(opts)}`, { headers: headers(opts), cache: "no-store" });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Firestore GET ${path} → ${res.status}`);
  return decodeDocument<T>((await res.json()) as FirestoreDocument);
}

/**
 * Lists documents of a collection with equality filters only (no composite
 * index needed); callers sort in memory — collections here stay small.
 */
export async function listDocuments<T>(
  collection: string,
  where: Record<string, string | boolean> = {},
  opts: Options = {},
): Promise<T[]> {
  const filters = Object.entries(where).map(([field, value]) => ({
    fieldFilter: {
      field: { fieldPath: field },
      op: "EQUAL",
      value: typeof value === "boolean" ? { booleanValue: value } : { stringValue: value },
    },
  }));
  const structuredQuery: Record<string, unknown> = { from: [{ collectionId: collection }] };
  if (filters.length === 1) structuredQuery.where = filters[0];
  if (filters.length > 1) structuredQuery.where = { compositeFilter: { op: "AND", filters } };

  const res = await fetch(`${base()}:runQuery${keyParam(opts)}`, {
    method: "POST",
    headers: headers(opts),
    body: JSON.stringify({ structuredQuery }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Firestore query ${collection} → ${res.status}`);
  const rows = (await res.json()) as { document?: FirestoreDocument }[];
  return rows.flatMap((row) => (row.document ? [decodeDocument<T>(row.document)] : []));
}
