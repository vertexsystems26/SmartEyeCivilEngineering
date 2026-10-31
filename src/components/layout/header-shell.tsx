"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Sticky header that compacts and blurs its backdrop once the page scrolls. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setCompact(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      data-compact={compact || undefined}
      className={cn(
        "sticky top-0 z-40 h-(--header-h) border-b border-transparent transition-[height,background-color,border-color] duration-300 ease-out",
        "data-compact:h-(--header-h-compact) data-compact:border-line data-compact:bg-sand-100/80 data-compact:backdrop-blur-md",
      )}
    >
      {children}
    </header>
  );
}
