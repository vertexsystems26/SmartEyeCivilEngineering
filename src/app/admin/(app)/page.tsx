import type { Metadata } from "next";
import { Dashboard } from "@/admin/components/dashboard";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return <Dashboard />;
}
