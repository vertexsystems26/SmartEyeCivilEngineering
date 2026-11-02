"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/* Small form primitives for the back-office, on the site's tokens. */

export const inputClass =
  "w-full min-h-11 rounded-control border border-sage-300 bg-paper px-3 py-2 text-[0.95rem] text-ink placeholder:text-pine-700/70 " +
  "transition-[border-color,box-shadow] duration-150 focus:border-pine-600 focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-pine-600/30";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClass, "min-h-24 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, "appearance-auto pr-8", className)} {...props}>
      {children}
    </select>
  );
}

type FieldShellProps = {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  /** e.g. character counter or translation badge, shown right of the label. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  as?: "div" | "fieldset";
};

/** Label + help text + error, wired with aria-describedby by the caller via ids. */
export function FieldShell({
  id,
  label,
  description,
  required,
  error,
  aside,
  children,
  className,
  as = "div",
}: FieldShellProps) {
  const Tag = as;
  const LabelTag = as === "fieldset" ? "legend" : "label";
  return (
    <Tag className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <LabelTag {...(as === "div" ? { htmlFor: id } : {})} className="text-small font-semibold text-ink">
          {label}
          {required ? <span className="text-pine-700"> *</span> : null}
        </LabelTag>
        {aside}
      </div>
      {children}
      {description ? (
        <p id={`${id}-desc`} className="text-[0.85rem] leading-snug text-pine-700">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="text-[0.85rem] font-semibold text-ink">
          ⚠ {error}
        </p>
      ) : null}
    </Tag>
  );
}

export function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={cn("label-mono", over ? "text-ink" : "text-pine-700")} aria-live="polite">
      {value.length}/{max}
    </span>
  );
}

export function StatusPill({ status }: { status: unknown }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        published ? "bg-pine-600 text-paper" : "border border-sage-300 bg-paper text-pine-700",
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", published ? "bg-paper" : "bg-slate-500")} />
      {published ? "Publié" : "Brouillon"}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="blueprint-grid flex flex-col items-center gap-3 rounded-card border border-dashed border-sage-300 px-6 py-14 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      {children}
    </div>
  );
}

export function Spinner({ label = "Chargement…" }: { label?: string }) {
  return (
    <p role="status" className="flex items-center gap-3 py-10 text-pine-700">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-sage-300 border-t-pine-600"
      />
      {label}
    </p>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-control bg-mist-200", className)} />;
}
