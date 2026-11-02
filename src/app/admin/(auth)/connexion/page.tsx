import type { Metadata } from "next";
import { LoginScreen } from "@/admin/components/auth-screens";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return <LoginScreen />;
}
