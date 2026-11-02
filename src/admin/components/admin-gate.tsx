"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/auth";
import { AuthCard, trySendVerification } from "./auth-screens";
import { AdminShell } from "./shell";
import { Spinner } from "./ui";

/** Protects /admin: sign-in, verified address and a role are required. */
export function AdminGate({ children }: { children: ReactNode }) {
  const state = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (state.status === "signed-out") router.replace("/admin/connexion");
  }, [state.status, router]);

  if (state.status === "loading" || state.status === "signed-out") {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner label="Vérification de la session…" />
      </div>
    );
  }

  if (state.status === "unverified") {
    return (
      <AuthCard title="Confirmez votre adresse e-mail">
        <p>
          Un lien de confirmation a été envoyé à <strong>{state.user.email}</strong>. Cliquez dessus, puis sur le bouton
          ci-dessous. Pas reçu ? Regardez dans les spams (expéditeur noreply@…firebaseapp.com).
        </p>
        {resendMessage ? (
          <p role="status" className="rounded-control bg-mist-200 px-3 py-2 text-small">
            {resendMessage}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void state.refresh()}>J&apos;ai confirmé</Button>
          <Button
            variant="secondary"
            disabled={sending}
            onClick={async () => {
              setSending(true);
              const error = await trySendVerification(state.user);
              setResendMessage(error || `Nouveau lien envoyé à ${state.user.email}.`);
              setSending(false);
            }}
          >
            {sending ? "Envoi…" : "Renvoyer le lien"}
          </Button>
          <Button variant="ghost" onClick={() => void state.signOut()}>
            Se déconnecter
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (state.status === "no-role") {
    return (
      <AuthCard title="Accès en attente">
        <p>
          Le compte <strong>{state.user.email}</strong> n&apos;a pas encore de rôle. Demandez à un administrateur de
          vous inviter (Utilisateurs et rôles), puis reconnectez-vous.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => void state.refresh()}>Réessayer</Button>
          <Button variant="ghost" onClick={() => void state.signOut()}>
            Se déconnecter
          </Button>
        </div>
      </AuthCard>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
