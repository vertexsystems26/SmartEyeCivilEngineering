"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../lib/auth";
import { FeedbackProvider } from "./feedback";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FeedbackProvider>{children}</FeedbackProvider>
    </AuthProvider>
  );
}
