import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { mainNav } from "@/lib/navigation";
import { HeaderShell } from "./header-shell";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

export async function Header() {
  const t = await getTranslations();
  const items = mainNav.map((item) => ({ href: item.href, label: t(`nav.${item.key}`) }));

  return (
    <HeaderShell>
      <div className="container-site flex h-full items-center justify-between gap-6">
        <Link href="/" aria-label={t("a11y.homeLink")} className="shrink-0 rounded-control">
          <Logo signature={t("brand.signature")} />
        </Link>

        <nav aria-label={t("a11y.mainNav")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link href="/devis" className={buttonVariants({ size: "sm", className: "hidden md:inline-flex" })}>
            {t("header.cta")}
          </Link>
          <MobileMenu items={items} />
        </div>
      </div>
    </HeaderShell>
  );
}
