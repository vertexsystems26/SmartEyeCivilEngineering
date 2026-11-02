"use client";

import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role, UserDoc } from "@/lib/cms/types";
import { BOOTSTRAP_ADMIN_EMAIL } from "@/lib/firebase/config";
import { auth, db } from "./firebase";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  /** Signed in, but the address is not verified yet. */
  | { status: "unverified"; user: User }
  /** Signed in and verified, but no role (no invitation). */
  | { status: "no-role"; user: User }
  | { status: "ready"; user: User; profile: UserDoc };

type AuthContextValue = AuthState & { refresh: () => Promise<void>; signOut: () => Promise<void> };

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Resolves the signed-in user's profile. First sign-in of an invited person
 * (or of the company mailbox) creates the profile from the invitation, as
 * allowed by firestore.rules.
 */
async function resolveProfile(user: User): Promise<UserDoc | null> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: snap.id, ...(snap.data() as Omit<UserDoc, "id">) };

  const email = (user.email ?? "").toLowerCase();
  let role: Role | null = null;
  if (email === BOOTSTRAP_ADMIN_EMAIL) role = "admin";
  else {
    const invitation = await getDoc(doc(db, "invitations", email)).catch(() => null);
    if (invitation?.exists()) role = invitation.data().role as Role;
  }
  if (!role) return null;

  const profile = { email: user.email ?? "", displayName: user.displayName ?? "", role, createdAt: serverTimestamp() };
  await setDoc(ref, profile);
  if (email !== BOOTSTRAP_ADMIN_EMAIL) await deleteDoc(doc(db, "invitations", email)).catch(() => undefined);
  return { id: user.uid, email: profile.email, displayName: profile.displayName, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const evaluate = useCallback(async (user: User | null) => {
    if (!user) return setState({ status: "signed-out" });
    if (!user.emailVerified) return setState({ status: "unverified", user });
    // Make sure the ID token carries email_verified=true for the rules.
    await user.getIdToken(true);
    const profile = await resolveProfile(user).catch(() => null);
    setState(profile ? { status: "ready", user, profile } : { status: "no-role", user });
  }, []);

  useEffect(() => onAuthStateChanged(auth, (user) => void evaluate(user)), [evaluate]);

  const refresh = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    await evaluate(auth.currentUser);
  }, [evaluate]);

  const signOut = useCallback(() => fbSignOut(auth), []);

  return <AuthContext.Provider value={{ ...state, refresh, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** The signed-in profile; only call inside the authenticated area. */
export function useProfile() {
  const ctx = useAuth();
  if (ctx.status !== "ready") throw new Error("useProfile requires a signed-in user with a role");
  return { user: ctx.user, profile: ctx.profile };
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  editor: "Éditeur",
  sales: "Commercial",
};

export function can(role: Role, action: "content" | "config" | "inbox") {
  if (action === "content") return role === "admin" || role === "editor";
  if (action === "inbox") return role === "admin" || role === "sales";
  return role === "admin";
}
