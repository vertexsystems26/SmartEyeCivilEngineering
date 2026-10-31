import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { AppPathname } from "@/i18n/routing";
import type { NavItem } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "./page-header";

/*
 * Phase 1 placeholder for routes whose content arrives in phase 3.
 * It renders the real page frame (breadcrumb, single h1, hreflang) and is
 * marked noindex so the preview deployment never gets half-built pages indexed.
 */
export function stubPage(key: NavItem["key"], pathname: AppPathname) {
  async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("nav");
    return pageMetadata({ locale: await getLocale(), pathname, title: t(key), noindex: true });
  }

  async function Page() {
    const t = await getTranslations();
    const title = t(`nav.${key}`);
    return (
      <>
        <PageHeader label={t("brand.signature")} title={title} crumbs={[{ label: title }]} />
        <section className="container-site section">
          <p className="measure text-pine-700">{t("placeholder.soon")}</p>
        </section>
      </>
    );
  }

  return { Page, generateMetadata };
}
