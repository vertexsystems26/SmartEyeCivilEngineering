import { getTranslations } from "next-intl/server";
import { ChatIcon, DocumentIcon, PhoneIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";

const itemClass =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.8rem] font-semibold no-underline";

/** Fixed bottom bar on small screens: Call, WhatsApp (when enabled), Quote. */
export async function MobileActionBar() {
  const t = await getTranslations();

  return (
    <nav
      aria-label={t("a11y.quickActions")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="flex">
        <li className="flex flex-1">
          <a href={site.phones.mobile.href} className={`${itemClass} text-ink`} data-track="phone">
            <PhoneIcon />
            {t("mobileBar.call")}
          </a>
        </li>
        {site.whatsapp ? (
          <li className="flex flex-1">
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noopener"
              className={`${itemClass} text-ink`}
              data-track="whatsapp"
            >
              <ChatIcon />
              {t("mobileBar.whatsapp")}
              <span className="sr-only"> {t("a11y.external")}</span>
            </a>
          </li>
        ) : null}
        <li className="flex flex-1">
          <Link href="/devis" className={`${itemClass} bg-pine-600 text-paper`}>
            <DocumentIcon />
            {t("mobileBar.quote")}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
