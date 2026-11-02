"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { Role, UserDoc } from "@/lib/cms/types";
import { ROLE_LABELS, useProfile } from "../lib/auth";
import {
  cancelInvitation,
  invite,
  listInvitations,
  listUsers,
  removeUser,
  setUserRole,
  type AnyDoc,
} from "../lib/data";
import { errorMessage, useFeedback } from "./feedback";
import { FieldShell, Input, Select, Spinner } from "./ui";

const ROLE_HELP: Record<Role, string> = {
  admin: "Tout, y compris les utilisateurs et la configuration.",
  editor: "Contenus, pages et médias. Pas la configuration ni les utilisateurs.",
  sales: "Messages et demandes de devis uniquement.",
};

export function UsersAdmin() {
  const { profile } = useProfile();
  const { notify, confirm } = useFeedback();
  const [users, setUsers] = useState<UserDoc[] | null>(null);
  const [invitations, setInvitations] = useState<AnyDoc[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");

  const apply = useCallback(([u, i]: [UserDoc[], AnyDoc[]]) => {
    setUsers(u.sort((a, b) => a.email.localeCompare(b.email)));
    setInvitations(i);
  }, []);

  const load = useCallback(
    () =>
      Promise.all([listUsers(), listInvitations()])
        .then(apply)
        .catch((error) => notify(errorMessage(error), "error")),
    [apply, notify],
  );

  useEffect(() => {
    Promise.all([listUsers(), listInvitations()])
      .then(apply)
      .catch((error) => notify(errorMessage(error), "error"));
  }, [apply, notify]);

  if (profile.role !== "admin") return <p>Cette page est réservée aux administrateurs.</p>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return notify("Adresse e-mail invalide.", "error");
    try {
      await invite(email, role, profile.email);
      notify(
        `Invitation enregistrée. Envoyez à ${email.trim()} le lien : ${window.location.origin}/admin/inscription`,
        "info",
      );
      setEmail("");
      await load();
    } catch (error) {
      notify(errorMessage(error), "error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Utilisateurs et rôles</h1>
        <p className="measure text-pine-700">
          Pour donner accès à quelqu&apos;un : invitez son adresse e-mail, puis envoyez-lui le lien de création de
          compte. Son accès s&apos;active dès qu&apos;il a confirmé son adresse.
        </p>
      </header>

      <section
        aria-labelledby="invite-title"
        className="flex flex-col gap-4 rounded-card border border-line bg-paper p-5"
      >
        <h2 id="invite-title" className="text-h3">
          Inviter une personne
        </h2>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-[1fr_14rem_auto] md:items-end">
          <FieldShell id="inv-email" label="Adresse e-mail" required>
            <Input id="inv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FieldShell>
          <FieldShell id="inv-role" label="Rôle">
            <Select id="inv-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </FieldShell>
          <Button type="submit">Inviter</Button>
        </form>
        <p className="text-[0.85rem] text-pine-700">{ROLE_HELP[role]}</p>

        {invitations.length ? (
          <ul className="flex flex-col divide-y divide-line border-t border-line text-small">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-3 py-2">
                <span className="flex-1">{inv.id}</span>
                <span className="label-mono text-pine-700">{ROLE_LABELS[inv.role as Role]} · en attente</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await cancelInvitation(inv.id).catch((e) => notify(errorMessage(e), "error"));
                    await load();
                  }}
                >
                  Annuler
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="users-title" className="flex flex-col gap-3">
        <h2 id="users-title" className="text-h3">
          Comptes actifs
        </h2>
        {users === null ? (
          <Spinner />
        ) : (
          <ul className="divide-y divide-line rounded-card border border-line bg-paper">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1 truncate text-small font-semibold">
                  {u.email}
                  {u.id === profile.id ? <span className="label-mono ml-2 text-pine-700">vous</span> : null}
                </span>
                <Select
                  aria-label={`Rôle de ${u.email}`}
                  value={u.role}
                  disabled={u.id === profile.id}
                  onChange={async (e) => {
                    try {
                      await setUserRole(u.id, e.target.value as Role);
                      notify("Rôle modifié.");
                      await load();
                    } catch (error) {
                      notify(errorMessage(error), "error");
                    }
                  }}
                  className="w-48"
                >
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>
                {u.id !== profile.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "Retirer l'accès ?",
                        message: (
                          <p>
                            {u.email} ne pourra plus accéder à l&apos;administration. Son compte de connexion reste à
                            supprimer dans la console Firebase si besoin.
                          </p>
                        ),
                        confirmLabel: "Retirer l'accès",
                        danger: true,
                      });
                      if (!ok) return;
                      await removeUser(u.id).catch((e) => notify(errorMessage(e), "error"));
                      await load();
                    }}
                  >
                    Retirer
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
