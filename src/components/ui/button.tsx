import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * Shared button styles. Apply `buttonVariants()` to <Link>/<a> for links
 * that look like buttons; use <Button> for actions.
 * All sizes keep a 44px minimum touch target.
 */
const baseVariants = cva(
  [
    "group/btn inline-flex min-h-11 items-center justify-center gap-2 rounded-control font-sans font-semibold",
    "whitespace-nowrap no-underline select-none",
    "transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-60",
  ],
  {
    variants: {
      variant: {
        primary: "bg-pine-600 text-paper shadow-sm hover:bg-pine-700 hover:shadow-md",
        secondary: "border border-line bg-paper text-ink shadow-sm hover:border-pine-600 hover:shadow-md",
        ghost: "text-ink hover:bg-mist-200",
        inverse: "bg-sand-100 text-ink hover:bg-paper",
      },
      size: {
        sm: "h-11 px-4 text-small",
        md: "h-12 px-5 text-[0.98rem]",
        lg: "h-14 px-7 text-body",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariantProps = VariantProps<typeof baseVariants>;

/** Button classes; an extra `className` is merged so it can override base utilities (e.g. `hidden`, `px-0`). */
export function buttonVariants({ className, ...props }: ButtonVariantProps & { className?: string } = {}) {
  return cn(baseVariants(props), className);
}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}
