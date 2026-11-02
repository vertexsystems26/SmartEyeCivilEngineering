"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { ROLE_LABELS, can, useProfile, useAuth } from "../lib/auth";

type Item = { href: string; label: string; show?: boolean };

/** Sidebar groups and order from brief §7.1 (inbox arrives in phase 3). */
function useNav(): { title: string; items: Item[] }[] {
  const { profile } = useProfile();
  const content = can(profile.role, "content");
  const config = can(profile.role, "config");
  return [
    { title: "", items: [{ href: "/admin", label: "Tableau de bord" }] },
    {
      title: "Contenu",
      items: [
        { href: "/admin/projets", label: "Projets", show: content },
        { href: "/admin/services", label: "Services", show: content },
        { href: "/admin/actualites", label: "Actualités", show: content },
        { href: "/admin/categories", label: "Catégories", show: content },
      ],
    },
    { title: "Pages", items: [{ href: "/admin/a-propos", label: "À propos", show: content }] },
    { title: "Médias", items: [{ href: "/admin/medias", label: "Médiathèque", show: content }] },
    {
      title: "Configuration",
      items: [
        { href: "/admin/utilisateurs", label: "Utilisateurs et rôles", show: config },
        { href: "/admin/aide", label: "Aide" },
      ],
    },
  ]
    .map((g) => ({ ...g, items: g.items.filter((i) => i.show !== false) }))
    .filter((g) => g.items.length);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = useNav();
  return (
    <nav aria-label="Administration" className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.title || "root"} className="flex flex-col gap-1">
          {group.title ? <p className="label-mono px-3 pb-1 text-mist-200/80">{group.title}</p> : null}
          {group.items.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center rounded-control px-3 text-[0.95rem] font-medium text-sand-100 no-underline transition-colors",
                  active ? "bg-sand-100 text-ink" : "hover:bg-pine-700",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function UserBox() {
  const { profile } = useProfile();
  const { signOut } = useAuth();
  return (
    <div className="flex flex-col gap-2 border-t border-pine-700 pt-4">
      <p className="truncate text-small text-sand-100">{profile.email}</p>
      <p className="label-mono text-mist-200">{ROLE_LABELS[profile.role]}</p>
      <div className="flex gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-10 items-center rounded-control px-2 text-small text-sand-100 underline hover:bg-pine-700"
        >
          Voir le site ↗
        </a>
        <button
          type="button"
          onClick={() => void signOut()}
          className="ml-auto min-h-10 rounded-control px-3 text-small font-semibold text-sand-100 hover:bg-pine-700"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a href="#admin-main" className="skip-link">
        Aller au contenu
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 overflow-y-auto bg-deep p-5 lg:flex">
        <Link href="/admin" className="flex flex-col gap-1 no-underline">
          <span className="font-display text-xl font-bold tracking-[0.12em] text-sand-100">S.E.C.E</span>
          <span className="label-mono text-mist-200">Administration</span>
        </Link>
        <div className="flex-1">
          <NavList />
        </div>
        <UserBox />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-deep px-4 lg:hidden">
        <Link href="/admin" className="font-display font-bold tracking-[0.12em] text-sand-100 no-underline">
          S.E.C.E <span className="label-mono ml-2 text-mist-200">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="grid size-11 place-items-center rounded-control text-sand-100"
        >
          <MenuIcon width={24} height={24} />
          <span className="sr-only">Ouvrir le menu</span>
        </button>
      </div>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu d'administration"
          className="fixed inset-0 z-50 flex flex-col gap-6 overflow-y-auto bg-deep p-5 lg:hidden"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-11 place-items-center self-end rounded-control text-sand-100"
            autoFocus
          >
            <CloseIcon width={24} height={24} />
            <span className="sr-only">Fermer le menu</span>
          </button>
          <NavList onNavigate={() => setOpen(false)} />
          <UserBox />
        </div>
      ) : null}

      <main id="admin-main" tabIndex={-1} className="min-w-0 px-4 py-6 focus:outline-none md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
