import { cn } from "@/lib/utils/cn";

/*
 * PROVISIONAL typographic wordmark. The real logo (red/orange/black roofs)
 * must be used as supplied, never recoloured: drop the SVG/PNG in
 * public/brand/ and replace the inner markup with <Image>. The light
 * rounded container (--paper) is the one required by the brief.
 */
export function Logo({ className, signature }: { className?: string; signature?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="inline-flex h-10 items-center rounded-control border border-line bg-paper px-3 shadow-sm">
        <span className="font-display text-[1.15rem] leading-none font-bold tracking-[0.12em] text-ink">S.E.C.E</span>
      </span>
      {signature ? (
        <span className="label-mono hidden max-w-[11rem] leading-tight text-pine-700 xl:inline">{signature}</span>
      ) : null}
    </span>
  );
}
