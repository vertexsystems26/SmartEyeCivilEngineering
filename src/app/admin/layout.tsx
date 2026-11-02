import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AdminProviders } from "@/admin/components/providers";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/lib/site";
import "../globals.css";

// Separate root layout: the back-office is French-only, client-rendered and never indexed.
export const metadata: Metadata = {
  title: { template: "%s · Administration S.E.C.E", default: "Administration S.E.C.E" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: site.themeColor };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" dir="ltr" className={fontVariables}>
      <body className="min-h-dvh">
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
