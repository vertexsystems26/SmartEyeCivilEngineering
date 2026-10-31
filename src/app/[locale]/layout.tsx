import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { isLocale, locales } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    metadataBase: new URL(site.url),
    title: { template: t("titleTemplate"), default: t("defaultTitle") },
    description: t("defaultDescription"),
    applicationName: site.shortName,
    openGraph: { type: "website", siteName: site.name },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
    robots: site.indexable ? undefined : { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: site.themeColor,
  width: "device-width",
  initialScale: 1,
};

// Only the namespaces used by client components are sent to the browser.
const CLIENT_NAMESPACES = ["a11y", "header", "nav", "error"] as const;

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!isLocale(locale)) notFound();

  const [t, messages] = await Promise.all([getTranslations("a11y"), getMessages()]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    // dir is ready for a future Arabic locale (CSS uses logical properties).
    <html lang={locale} dir="ltr" className={fontVariables}>
      <body className="flex min-h-dvh flex-col pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
        <NextIntlClientProvider messages={clientMessages}>
          <a href="#contenu" className="skip-link">
            {t("skipToContent")}
          </a>
          <Header />
          <main id="contenu" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
          <MobileActionBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
