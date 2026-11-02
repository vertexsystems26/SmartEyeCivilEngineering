import type { Metadata } from "next";
import { SchemaEditor } from "@/admin/components/schema-pages";

export const metadata: Metadata = { title: "À propos" };

export default function AboutAdminPage() {
  return <SchemaEditor singleton="a-propos" />;
}
