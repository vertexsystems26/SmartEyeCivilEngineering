import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  /** Section index shown in mono, e.g. 1 → "01". */
  index?: number;
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
};

/** "01 / Services" mono label, then the heading and an optional intro. */
export function SectionHeading({ index, label, title, intro, as: Tag = "h2", id, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex max-w-3xl flex-col gap-4", className)}>
      <p className="label-mono flex items-center gap-3 text-pine-700">
        {index !== undefined ? (
          <>
            <span>{String(index).padStart(2, "0")}</span>
            <span aria-hidden="true" className="h-px w-8 bg-sage-300" />
          </>
        ) : null}
        <span>{label}</span>
      </p>
      <Tag id={id}>{title}</Tag>
      {intro ? <div className="measure text-lead text-ink/85">{intro}</div> : null}
    </div>
  );
}
