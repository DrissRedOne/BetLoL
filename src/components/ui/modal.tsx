"use client";

import { cn } from "@/lib/utils";
import { useEffect, useCallback, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

function Modal({ open, onClose, title, children, className }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Fermer"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl bg-[#111827] border border-white/[0.06] p-6",
          "shadow-xl animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-[#E2E8F0]">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

export { Modal, type ModalProps };
