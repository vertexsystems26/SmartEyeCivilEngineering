import { SchemaList } from "@/admin/components/schema-pages";
import { collectionSchemas } from "@/admin/schemas";

export function generateStaticParams() {
  return collectionSchemas.map((s) => ({ collection: s.slug }));
}

export default function CollectionPage() {
  return <SchemaList />;
}
