import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { isLocale, routing } from "./routing";

/**
 * The locale comes from the [locale] root segment via next/root-params,
 * which keeps pages statically renderable (no headers() read).
 * Server Actions and Route Handlers cannot read root params: they must pass
 * the locale explicitly, e.g. getTranslations({ locale, namespace }).
 */
export default getRequestConfig(async ({ locale: override }) => {
  const candidate = override ?? (await rootLocale());
  const locale = isLocale(candidate) ? candidate : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Africa/Tunis",
  };
});
