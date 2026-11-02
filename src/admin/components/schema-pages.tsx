"use client";

import { notFound, useParams } from "next/navigation";
import { aboutSchema, schemaBySlug } from "../schemas";
import { CollectionList } from "./collection-list";
import { DocumentEditor } from "./document-editor";

/** /admin/<collection> */
export function SchemaList() {
  const { collection } = useParams<{ collection: string }>();
  const schema = schemaBySlug(collection);
  if (!schema) notFound();
  return <CollectionList key={schema.slug} schema={schema} />;
}

/** /admin/<collection>/<id> and the single page editors (À propos). */
export function SchemaEditor({ singleton }: { singleton?: "a-propos" }) {
  const params = useParams<{ collection?: string; id?: string }>();
  const schema = singleton ? aboutSchema : schemaBySlug(params.collection ?? "");
  if (!schema) notFound();
  return <DocumentEditor key={`${schema.slug}-${params.id ?? ""}`} schema={schema} id={params.id} />;
}
