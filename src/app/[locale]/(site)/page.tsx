import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { StructureFrame } from "@/components/sections/structure-frame";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ locale: await getLocale(), pathname: "/" });
}

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <section aria-labelledby="hero-title" className="blueprint-grid border-b border-line">
      <div className="container-site grid items-center gap-12 pt-10 pb-20 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <p className="label-mono text-pine-700">{t("eyebrow")}</p>
          <h1 id="hero-title" className="max-w-[16ch]">
            {t("title")}
          </h1>
          <p className="measure text-lead">{t("subtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/devis" className={buttonVariants({ size: "lg" })}>
              {t("ctaPrimary")}
              <ArrowRightIcon className="transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
            <Link href="/projets" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              {t("ctaSecondary")}
            </Link>
          </div>
          <p className="label-mono text-pine-700">{site.slogan}</p>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-large border border-line bg-paper/70 p-6 shadow-md md:p-10">
            <StructureFrame title={t("frameAlt")} className="mx-auto h-auto w-full max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
