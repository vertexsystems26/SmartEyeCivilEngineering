import type { Metadata } from "next";
import { Help } from "@/admin/components/help";

export const metadata: Metadata = { title: "Aide" };

export default function HelpPage() {
  return <Help />;
}
