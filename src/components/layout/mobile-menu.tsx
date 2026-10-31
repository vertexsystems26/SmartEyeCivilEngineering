"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { buttonVariants } from "@/components/ui/button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { LanguageSwitcher } from "./language-switcher";

type Item = { href: StaticPathname; label: string };

/*
 * Full-screen mobile menu built on a native modal <dialog>: focus trapping,
 * Escape to close and the inert background come from the browser.
 * Links cascade in with a CSS stagger (reduced to a fade by the global
 * prefers-reduced-motion rule).
 */
export function MobileMenu({ items }: { items: Item[] }) {
  const t = useTranslations();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // Every link inside closes the menu on click, so navigation never leaves it open.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={buttonVariants({ variant: "ghost", size: "sm", className: "w-11 px-0 lg:hidden" })}
      >
        <MenuIcon width={24} height={24} />
        <span className="sr-only">{t("a11y.openMenu")}</span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label={t("a11y.mainNav")}
        className="mobile-menu fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-sand-100 p-0 text-ink backdrop:bg-deep/40"
      >
        <div className="blueprint-grid flex h-full flex-col">
          <div className="container-site flex h-(--header-h) shrink-0 items-center justify-between">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: "ghost", size: "sm", className: "w-11 px-0" })}
            >
              <CloseIcon width={24} height={24} />
              <span className="sr-only">{t("a11y.closeMenu")}</span>
            </button>
          </div>

          <nav aria-label={t("a11y.mainNav")} className="container-site flex-1 overflow-y-auto py-6">
            <ul className="flex flex-col">
              {items.map((item, i) => (
                <li
                  key={item.href}
                  className="mobile-menu-item border-b border-line"
                  style={{ "--i": i } as CSSProperties}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-16 items-center justify-between font-display text-[1.75rem] font-semibold tracking-tight no-underline"
                  >
                    <span>{item.label}</span>
                    <span className="label-mono text-slate-500" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="container-site shrink-0 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
            <Link href="/devis" onClick={() => setOpen(false)} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              {t("header.cta")}
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
