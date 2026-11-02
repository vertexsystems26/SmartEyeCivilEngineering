import type { Metadata } from "next";
import { UsersAdmin } from "@/admin/components/users-admin";

export const metadata: Metadata = { title: "Utilisateurs et rôles" };

export default function UsersPage() {
  return <UsersAdmin />;
}
