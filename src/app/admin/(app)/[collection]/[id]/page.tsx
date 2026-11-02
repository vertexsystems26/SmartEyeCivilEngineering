import { SchemaEditor } from "@/admin/components/schema-pages";
import { collectionSchemas } from "@/admin/schemas";

// Document ids are only known in the browser; "nouveau" is prerendered as the shell.
export function generateStaticParams() {
  return collectionSchemas.map((s) => ({ collection: s.slug, id: "nouveau" }));
}

export default function DocumentPage() {
  return <SchemaEditor />;
}
