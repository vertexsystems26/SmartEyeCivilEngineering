import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

/**
 * French lives at the root, English under /en. Keys are the internal
 * (French) folder names in src/app/[locale]/(site); values are the public
 * URLs per locale. Content slugs ([slug]) are translated in the CMS.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  // Deterministic URLs: no redirect based on Accept-Language or cookie.
  // Visitors switch language with the header switcher.
  localeDetection: false,
  localeCookie: false,
  pathnames: {
    "/": "/",
    "/a-propos": { fr: "/a-propos", en: "/about" },
    "/services": { fr: "/services", en: "/services" },
    "/services/[slug]": { fr: "/services/[slug]", en: "/services/[slug]" },
    "/projets": { fr: "/projets", en: "/projects" },
    "/projets/[slug]": { fr: "/projets/[slug]", en: "/projects/[slug]" },
    "/equipe": { fr: "/equipe", en: "/team" },
    "/actualites": { fr: "/actualites", en: "/news" },
    "/actualites/[slug]": { fr: "/actualites/[slug]", en: "/news/[slug]" },
    "/contact": { fr: "/contact", en: "/contact" },
    "/devis": { fr: "/devis", en: "/quote" },
    "/faq": { fr: "/faq", en: "/faq" },
    "/mentions-legales": { fr: "/mentions-legales", en: "/legal-notice" },
    "/politique-de-confidentialite": {
      fr: "/politique-de-confidentialite",
      en: "/privacy-policy",
    },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
/** Routes without a dynamic segment: usable as a plain string href. */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
