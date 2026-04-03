"use client";

import { ToastProvider } from "@/components/ui/toast";
import { NotificationProvider } from "@/components/layout/notification-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </ToastProvider>
  );
}
