import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { footerNav } from "@/lib/navigation";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <section className="blueprint-grid">
      <div className="container-site section grid items-center gap-12 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <p className="label-mono text-pine-700">{t("notFound.label")}</p>
          <h1>{t("notFound.title")}</h1>
          <p className="measure text-lead">{t("notFound.text")}</p>
          <ul className="flex flex-wrap gap-2">
            {footerNav.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/" className={buttonVariants({ className: "self-start" })}>
            {t("notFound.home")}
          </Link>
        </div>
        {/* Broken-beam drawing: the "illustrated" 404 */}
        <svg viewBox="0 0 320 200" aria-hidden="true" className="w-full max-w-sm lg:col-span-5" fill="none">
          <line x1="40" y1="40" x2="40" y2="180" stroke="var(--pine-600)" strokeWidth="6" />
          <line x1="280" y1="40" x2="280" y2="180" stroke="var(--pine-600)" strokeWidth="6" />
          <path d="M28 60h120l8 10" stroke="var(--ink)" strokeWidth="4" />
          <path d="M292 60H178l-6 18" stroke="var(--ink)" strokeWidth="4" />
          <path d="M150 74l6-4 4 8 6-6 6 8" stroke="var(--slate-500)" strokeWidth="1.5" />
          <line x1="20" y1="182" x2="300" y2="182" stroke="var(--slate-500)" strokeDasharray="6 6" />
          <text x="160" y="140" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="28" fill="var(--pine-700)">
            404
          </text>
        </svg>
      </div>
    </section>
  );
}
