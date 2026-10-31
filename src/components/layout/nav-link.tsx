"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { cn } from "@/lib/utils/cn";

/** Header link with an animated underline and aria-current on the active section. */
export function NavLink({ href, className, children }: { href: StaticPathname } & Omit<ComponentProps<"a">, "href">) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex min-h-11 items-center px-3 text-[0.95rem] font-medium text-ink no-underline",
        "after:absolute after:inset-x-3 after:bottom-2 after:h-px after:origin-left after:scale-x-0 after:bg-pine-600",
        "after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100",
        "aria-[current=page]:after:scale-x-100",
        className,
      )}
    >
      {children}
    </Link>
  );
}
