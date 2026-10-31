import type { StaticPathname } from "@/i18n/routing";
import type messages from "@/messages/fr.json";

type NavKey = keyof (typeof messages)["nav"];
export type NavItem = { key: NavKey; href: StaticPathname };

// Static fallback; the Navigation document in Firestore replaces it in phase 2.
export const mainNav: NavItem[] = [
  { key: "services", href: "/services" },
  { key: "projects", href: "/projets" },
  { key: "about", href: "/a-propos" },
  { key: "team", href: "/equipe" },
  { key: "news", href: "/actualites" },
  { key: "contact", href: "/contact" },
];

export const footerNav: NavItem[] = [
  { key: "home", href: "/" },
  ...mainNav,
  { key: "quote", href: "/devis" },
  { key: "faq", href: "/faq" },
];

export const legalNav: NavItem[] = [
  { key: "legal", href: "/mentions-legales" },
  { key: "privacy", href: "/politique-de-confidentialite" },
];
