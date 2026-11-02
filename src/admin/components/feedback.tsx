"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

/* ---------- Toasts ---------- */

type Toast = { id: number; kind: "success" | "error" | "info"; message: string };
type Confirm = { title: string; message: ReactNode; confirmLabel: string; danger?: boolean };

type FeedbackContext = {
  notify: (message: string, kind?: Toast["kind"]) => void;
  /** Resolves true when the user confirms (brief: confirmation before any deletion). */
  confirm: (options: Confirm) => Promise<boolean>;
};

const Ctx = createContext<FeedbackContext | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(Confirm & { resolve: (ok: boolean) => void }) | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const counter = useRef(0);

  const notify = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = ++counter.current;
    setToasts((list) => [...list, { id, kind, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === "error" ? 8000 : 4000);
  }, []);

  const confirm = useCallback(
    (options: Confirm) => new Promise<boolean>((resolve) => setDialog({ ...options, resolve })),
    [],
  );

  useEffect(() => {
    if (dialog && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [dialog]);

  const close = (ok: boolean) => {
    dialog?.resolve(ok);
    dialogRef.current?.close();
    setDialog(null);
  };

  return (
    <Ctx.Provider value={{ notify, confirm }}>
      {children}

      <div
        aria-live="polite"
        className="fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {toasts.map((t) => (
          <p
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "max-w-sm rounded-control border px-4 py-3 text-small font-medium shadow-lg",
              t.kind === "error" && "border-ink bg-ink text-paper",
              t.kind === "success" && "border-pine-700 bg-pine-700 text-paper",
              t.kind === "info" && "border-line bg-paper text-ink",
            )}
          >
            {t.message}
          </p>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          close(false);
        }}
        aria-labelledby="confirm-title"
        className="m-auto w-[min(92vw,30rem)] rounded-card border border-line bg-paper p-0 text-ink shadow-lg backdrop:bg-deep/50"
      >
        {dialog ? (
          <div className="flex flex-col gap-4 p-6">
            <h2 id="confirm-title" className="text-h3">
              {dialog.title}
            </h2>
            <div className="text-small">{dialog.message}</div>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => close(false)} autoFocus>
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() => close(true)}
                className={dialog.danger ? "bg-ink hover:bg-deep" : undefined}
              >
                {dialog.confirmLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </dialog>
    </Ctx.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return ctx;
}

/** Error message for the user, in French, from any thrown value. */
export function errorMessage(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  if (code === "permission-denied")
    return "Action refusée : vos droits ne le permettent pas (ou les règles Firestore ne sont pas publiées).";
  if (code === "unavailable") return "Connexion impossible. Vérifiez votre accès à Internet.";
  return error instanceof Error ? error.message : "Une erreur est survenue.";
}
