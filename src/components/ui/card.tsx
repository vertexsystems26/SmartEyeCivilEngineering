import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Lifts and outlines on hover; use when the whole card is a link target. */
  interactive?: boolean;
};

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-paper shadow-md",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-pine-600 hover:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-pine-700",
        className,
      )}
      {...props}
    />
  );
}
