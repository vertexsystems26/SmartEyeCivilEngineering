import type { Metadata } from "next";
import { SignupScreen } from "@/admin/components/auth-screens";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return <SignupScreen />;
}
