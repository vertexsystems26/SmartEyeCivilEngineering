import type { ReactNode } from "react";
import { Breadcrumb, type Crumb } from "@/components/ui/breadcrumb";

type PageHeaderProps = {
  label: string;
  title: ReactNode;
  intro?: ReactNode;
  crumbs: Crumb[];
};

/** Header band of inner pages: breadcrumb, mono label, the page's single h1. */
export function PageHeader({ label, title, intro, crumbs }: PageHeaderProps) {
  return (
    <header className="blueprint-grid border-b border-line">
      <div className="container-site flex flex-col gap-8 pt-10 pb-16 md:pt-14 md:pb-24">
        <Breadcrumb items={crumbs} />
        <div className="flex max-w-4xl flex-col gap-5">
          <p className="label-mono text-pine-700">{label}</p>
          <h1>{title}</h1>
          {intro ? <div className="measure text-lead">{intro}</div> : null}
        </div>
      </div>
    </header>
  );
}
