import type { ReactNode } from "react";
import { AdminGate } from "@/admin/components/admin-gate";

export default function AdminAppLayout({ children }: { children: ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
