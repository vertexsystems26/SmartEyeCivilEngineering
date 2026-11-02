/* eslint-disable @next/next/no-img-element -- admin thumbnails: original files from R2, no optimisation needed */
import type { MediaKind } from "@/lib/cms/types";
import { cn } from "@/lib/utils/cn";

const KIND_LABEL: Record<MediaKind, string> = { image: "Image", model: "3D", document: "PDF" };

export function MediaThumb({
  url,
  kind = "image",
  alt = "",
  className,
  focal,
}: {
  url: string;
  kind?: MediaKind;
  alt?: string;
  className?: string;
  focal?: { x: number; y: number };
}) {
  if (kind !== "image") {
    return (
      <div className={cn("blueprint-grid grid aspect-[4/3] place-items-center bg-mist-200", className)}>
        <span className="label-mono rounded-full bg-paper px-3 py-1 text-pine-700">{KIND_LABEL[kind]}</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("aspect-[4/3] w-full bg-mist-200 object-cover", className)}
      style={focal ? { objectPosition: `${focal.x}% ${focal.y}%` } : undefined}
    />
  );
}
