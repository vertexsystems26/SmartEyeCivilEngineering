import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { defaultLocale, locales, type AppPathname, type Locale } from "@/i18n/routing";
import { site } from "@/lib/site";

type Href = Parameters<typeof getPathname>[0]["href"];

export function absoluteUrl(path: string) {
  return `${site.url}${path === "/" ? "" : path}` || site.url;
}

/** Absolute URL of a route in a given locale, e.g. ("/a-propos", "en") → https://…/en/about */
export function localizedUrl(href: Href, locale: Locale) {
  return absoluteUrl(getPathname({ href, locale }));
}

/**
 * Canonical + hreflang (fr, en, x-default → fr) for a route.
 * Content pages whose slug differs per locale pass one href per locale.
 */
export function alternates(href: Href | Record<Locale, Href>, locale: Locale): Metadata["alternates"] {
  const hrefFor = (l: Locale) =>
    typeof href === "object" && href !== null && "fr" in href ? (href as Record<Locale, Href>)[l] : (href as Href);

  const languages = Object.fromEntries(locales.map((l) => [l, localizedUrl(hrefFor(l), l)]));
  return {
    canonical: localizedUrl(hrefFor(locale), locale),
    languages: { ...languages, "x-default": localizedUrl(hrefFor(defaultLocale), defaultLocale) },
  };
}

type PageMetaInput = {
  locale: Locale;
  pathname: AppPathname;
  title?: string;
  description?: string;
  noindex?: boolean;
};

/** Metadata for a static route; the layout supplies the title template and defaults. */
export function pageMetadata({ locale, pathname, title, description, noindex }: PageMetaInput): Metadata {
  const url = localizedUrl(pathname as Href, locale);
  // Undefined keys are left out: an explicit `title: undefined` would erase the layout default.
  const text = { ...(title && { title }), ...(description && { description }) };
  return {
    ...text,
    alternates: alternates(pathname as Href, locale),
    openGraph: { url, ...text, locale: locale === "fr" ? "fr_TN" : "en_US" },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}
