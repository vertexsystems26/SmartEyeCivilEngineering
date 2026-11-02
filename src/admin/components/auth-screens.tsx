"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  type User,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../lib/auth";
import { auth } from "../lib/firebase";
import { FieldShell, Input, Spinner } from "./ui";

function authError(code: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Adresse e-mail ou mot de passe incorrect.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Le compte est temporairement bloqué : réessayez dans quelques minutes ou réinitialisez le mot de passe.";
    case "auth/email-already-in-use":
      return "Un compte existe déjà avec cette adresse : connectez-vous.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Mot de passe trop faible.";
    case "auth/invalid-email":
      return "Adresse e-mail invalide.";
    case "auth/network-request-failed":
      return "Connexion impossible. Vérifiez votre accès à Internet.";
    default:
      return "La connexion a échoué. Réessayez.";
  }
}

const code = (e: unknown) => (e as { code?: string })?.code ?? "";

/**
 * Sends the confirmation link, returning to /admin afterwards when the current
 * domain is in Firebase's authorized domains. Otherwise Firebase rejects the
 * whole request, so we fall back to its default confirmation page.
 */
export async function sendVerification(user: User) {
  try {
    await sendEmailVerification(user, { url: `${window.location.origin}/admin` });
  } catch (err) {
    if (!/continue-uri|unauthorized-domain/.test(code(err))) throw err;
    await sendEmailVerification(user);
  }
}

/** Message for a failed confirmation e-mail, or "" on success. */
export async function trySendVerification(user: User) {
  try {
    await sendVerification(user);
    return "";
  } catch (err) {
    return code(err) === "auth/too-many-requests"
      ? "Un lien vient déjà d'être envoyé. Patientez une minute avant d'en demander un autre."
      : `L'envoi de l'e-mail a échoué (${code(err) || "erreur inconnue"}). Réessayez dans un instant.`;
  }
}

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <main className="blueprint-grid grid min-h-dvh place-items-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-large border border-line bg-paper p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="font-display text-xl font-bold tracking-[0.12em]">S.E.C.E</p>
          <p className="label-mono text-pine-700">Administration du site</p>
        </div>
        <h1 className="text-[1.75rem]">{title}</h1>
        {children}
        {footer ? <div className="border-t border-line pt-4 text-small">{footer}</div> : null}
      </div>
    </main>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-control border border-ink bg-sand-100 px-3 py-2 text-small font-semibold">
      {children}
    </p>
  );
}

/* ---------- Sign in + password reset ---------- */

export function LoginScreen() {
  const router = useRouter();
  const state = useAuth();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state.status !== "loading" && state.status !== "signed-out") router.replace("/admin");
  }, [state.status, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await sendPasswordResetEmail(auth, email.trim());
        setInfo("Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d'être envoyé.");
      }
    } catch (err) {
      // Never reveal whether an address has an account on reset.
      if (mode === "reset")
        setInfo("Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d'être envoyé.");
      else setError(authError(code(err)));
    } finally {
      setBusy(false);
    }
  }

  if (state.status === "loading")
    return (
      <AuthCard title="Connexion">
        <Spinner />
      </AuthCard>
    );

  return (
    <AuthCard
      title={mode === "login" ? "Connexion" : "Mot de passe oublié"}
      footer={
        mode === "login" ? (
          <p>
            Vous avez reçu une invitation ?{" "}
            <Link href="/admin/inscription" className="link font-semibold">
              Créer votre compte
            </Link>
          </p>
        ) : null
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error ? <ErrorText>{error}</ErrorText> : null}
        {info ? (
          <p role="status" className="rounded-control bg-mist-200 px-3 py-2 text-small">
            {info}
          </p>
        ) : null}
        <FieldShell id="email" label="Adresse e-mail" required>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FieldShell>
        {mode === "login" ? (
          <FieldShell id="password" label="Mot de passe" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldShell>
        ) : null}
        <Button type="submit" disabled={busy || !email || (mode === "login" && !password)}>
          {busy ? "Patientez…" : mode === "login" ? "Se connecter" : "Recevoir le lien"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "reset" : "login")}
          className="link self-start text-small"
        >
          {mode === "login" ? "Mot de passe oublié ?" : "← Retour à la connexion"}
        </button>
      </form>
    </AuthCard>
  );
}

/* ---------- Sign up (invited people and the company mailbox) ---------- */

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

export function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [sendError, setSendError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!PASSWORD_RULE.test(password))
      return setError(
        "Le mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule et un chiffre.",
      );
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // The account exists from here on: a failed e-mail must not look like a failed sign-up.
      setSendError(await trySendVerification(cred.user));
      setDone(true);
    } catch (err) {
      setError(authError(code(err)));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Vérifiez votre boîte mail">
        {sendError ? (
          <ErrorText>
            Le compte est créé, mais {sendError.charAt(0).toLowerCase() + sendError.slice(1)} Utilisez « Renvoyer le
            lien » sur la page suivante.
          </ErrorText>
        ) : (
          <p>
            Un lien de confirmation a été envoyé à <strong>{email}</strong>. Ouvrez-le, puis revenez ici : votre accès
            sera activé automatiquement si une invitation correspond à cette adresse.
          </p>
        )}
        <p className="text-small text-pine-700">
          L&apos;e-mail vient de noreply@…firebaseapp.com : pensez à regarder dans les spams ou « Promotions ».
        </p>
        <Link href="/admin" className="link font-semibold">
          J&apos;ai confirmé mon adresse →
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Créer votre compte"
      footer={
        <p>
          Déjà un compte ?{" "}
          <Link href="/admin/connexion" className="link font-semibold">
            Se connecter
          </Link>
        </p>
      }
    >
      <p className="text-small text-pine-700">
        Réservé aux personnes invitées par un administrateur. Utilisez l&apos;adresse e-mail qui a reçu
        l&apos;invitation.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <FieldShell id="su-email" label="Adresse e-mail" required>
          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FieldShell>
        <FieldShell
          id="su-password"
          label="Mot de passe"
          required
          description="12 caractères minimum, avec majuscule, minuscule et chiffre."
        >
          <Input
            id="su-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="su-password-desc"
          />
        </FieldShell>
        <FieldShell id="su-confirm" label="Confirmer le mot de passe" required>
          <Input
            id="su-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FieldShell>
        <Button type="submit" disabled={busy || !email || !password}>
          {busy ? "Création…" : "Créer le compte"}
        </Button>
      </form>
    </AuthCard>
  );
}
