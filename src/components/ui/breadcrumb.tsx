import { getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronRightIcon } from "./icons";

export type Crumb = {
  label: string;
  /** Omit for the current page (last item). */
  href?: ComponentProps<typeof Link>["href"];
};

/** Breadcrumb trail; "Accueil" is prepended automatically. */
export async function Breadcrumb({ items }: { items: Crumb[] }) {
  const t = await getTranslations();
  const trail: Crumb[] = [{ label: t("nav.home"), href: "/" }, ...items];

  return (
    <nav aria-label={t("a11y.breadcrumb")}>
      <ol className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-pine-700">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <li key={i} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-6 items-center underline-offset-4 hover:text-ink hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {crumb.label}
                </span>
              )}
              {!isLast ? <ChevronRightIcon width={14} height={14} className="text-slate-500" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
