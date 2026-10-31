"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/*
 * Links to the same page in the other language. Static pages map through
 * routing.pathnames; content pages with a translated slug will provide
 * their alternate slug from the CMS (phase 3).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const target = locale === "fr" ? "en" : "fr";
  const pathname = usePathname();
  const params = useParams();

  return (
    <Link
      // The params belong to the current route, so the pair is always valid.
      href={{ pathname, params } as ComponentProps<typeof Link>["href"]}
      locale={target}
      hrefLang={target}
      lang={target}
      className={cn(
        "label-mono inline-flex min-h-11 items-center gap-2 rounded-control px-3 text-ink no-underline hover:bg-mist-200",
        className,
      )}
    >
      <span className="sr-only">{t("language")} : </span>
      {t("switchTo")}
    </Link>
  );
}
