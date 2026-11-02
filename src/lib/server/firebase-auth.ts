import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Role } from "@/lib/cms/types";
import { firebaseConfig } from "@/lib/firebase/config";
import { getDocument } from "./firestore-rest";

/*
 * Verifies Firebase ID tokens without firebase-admin (whose gRPC transport
 * does not run on Cloudflare Workers): signature against Google's public
 * keys, issuer and audience bound to our project.
 */
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export type AuthedUser = { uid: string; email: string; role: Role; token: string };

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

export async function verifyIdToken(token: string) {
  const projectId = firebaseConfig.projectId;
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });
  if (!payload.sub) throw new AuthError("Jeton invalide.", 401);
  return { uid: payload.sub, email: String(payload.email ?? "") };
}

/**
 * Authenticates a back-office request (Authorization: Bearer <ID token>) and
 * checks the caller's role. The profile is read with the caller's own token,
 * so Firestore rules still apply.
 */
export async function requireRole(request: Request, allowed: Role[]): Promise<AuthedUser> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new AuthError("Authentification requise.", 401);

  let identity: { uid: string; email: string };
  try {
    identity = await verifyIdToken(token);
  } catch {
    throw new AuthError("Session expirée ou invalide.", 401);
  }

  const profile = await getDocument<{ role?: Role }>(`users/${identity.uid}`, { idToken: token });
  const role = profile?.role;
  if (!role || !allowed.includes(role)) throw new AuthError("Droits insuffisants.", 403);

  return { ...identity, role, token };
}
