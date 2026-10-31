"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");

  useEffect(() => {
    // Sentry hooks in here in phase 7.
    console.error(error);
  }, [error]);

  return (
    <section className="container-site section flex flex-col gap-6">
      <p className="label-mono text-pine-700">{t("label")}</p>
      <h1>{t("title")}</h1>
      <p className="measure text-lead">{t("text")}</p>
      <Button onClick={reset} className="self-start">
        {t("retry")}
      </Button>
    </section>
  );
}
