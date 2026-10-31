import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { FacebookIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { footerNav, legalNav } from "@/lib/navigation";
import { mapsUrl, site } from "@/lib/site";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const t = await getTranslations();
  const year = await currentYear();

  return (
    <footer className="bg-deep text-sand-100">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="flex flex-col gap-4 md:col-span-4">
          <p className="font-display text-2xl font-bold tracking-[0.12em]">S.E.C.E</p>
          <p className="label-mono text-mist-200">{t("brand.signature")}</p>
          <p className="max-w-xs text-mist-200">{t("brand.baseline")}</p>
          <p className="label-mono text-mist-200">{site.slogan}</p>
        </div>

        <div className="md:col-span-4">
          <h2 className="label-mono mb-5 text-mist-200">{t("footer.contactTitle")}</h2>
          <address className="flex flex-col gap-4 not-italic">
            <a href={mapsUrl} target="_blank" rel="noopener" className="group flex gap-3 no-underline">
              <PinIcon className="mt-1 shrink-0 text-mist-200" />
              <span>
                {site.address.street}, {site.address.postalCode} {site.address.city}
                <span className="label-mono mt-1 block text-mist-200 group-hover:underline">
                  {site.address.plusCode} · {t("footer.openMap")}
                  <span className="sr-only"> {t("a11y.external")}</span>
                </span>
              </span>
            </a>
            <p className="flex gap-3">
              <PhoneIcon className="mt-1 shrink-0 text-mist-200" />
              <span className="flex flex-col">
                <a href={site.phones.mobile.href} className="hover:underline" data-track="phone">
                  <span className="text-mist-200">{t("footer.mobile")} </span>
                  {site.phones.mobile.display}
                </a>
                <a href={site.phones.landline.href} className="hover:underline" data-track="phone">
                  <span className="text-mist-200">{t("footer.landline")} </span>
                  {site.phones.landline.display}
                </a>
              </span>
            </p>
            <a href={`mailto:${site.email}`} className="flex gap-3 break-all hover:underline" data-track="email">
              <MailIcon className="mt-1 shrink-0 text-mist-200" />
              {site.email}
            </a>
            <a href={site.social.facebook} target="_blank" rel="noopener" className="flex gap-3 hover:underline">
              <FacebookIcon className="mt-1 shrink-0 text-mist-200" />
              {t("footer.facebook")}
              <span className="sr-only"> {t("a11y.external")}</span>
            </a>
          </address>
        </div>

        <nav aria-label={t("a11y.footerNav")} className="grid grid-cols-2 gap-8 md:col-span-4">
          <div>
            <h2 className="label-mono mb-5 text-mist-200">{t("footer.sitemapTitle")}</h2>
            <ul className="flex flex-col gap-1">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-9 items-center hover:underline">
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="label-mono mb-5 text-mist-200">{t("footer.legalTitle")}</h2>
            <ul className="flex flex-col gap-1">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-9 items-center hover:underline">
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="border-t border-pine-700">
        <p className="container-site label-mono py-6 text-mist-200">
          © {year} {site.name} ({site.legalForm}). {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
