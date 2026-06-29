"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeleteConfirmModalItem {
  icon: React.ElementType;
  label: string;
}

interface PerfilDeleteConfirmModalProps {
  open: boolean;
  loading?: boolean;
  items: readonly DeleteConfirmModalItem[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function PerfilDeleteConfirmModal({
  open,
  loading = false,
  items,
  onConfirm,
  onCancel,
}: PerfilDeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  const handleCancel = useCallback(() => {
    if (loading) return;
    onCancel();
  }, [loading, onCancel]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleCancel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleCancel]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="delete-account-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-verde-escuro-capa/45 backdrop-blur-[6px]"
            aria-label="Fechar confirmação"
            onClick={handleCancel}
            disabled={loading}
          />

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-modal-title"
            aria-describedby="delete-confirm-modal-desc"
            className={cn(
              "relative z-10 w-full max-w-md overflow-hidden rounded-block border border-red-200/90 bg-white",
              "shadow-[0_24px_64px_rgba(13,102,50,0.18)] ring-1 ring-red-100",
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-l-[5px] border-l-red-500">
              <div className="flex items-start gap-3 px-5 pb-4 pt-5 sm:gap-4 sm:px-6 sm:pb-5 sm:pt-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 sm:size-12">
                  <ShieldAlert className="size-5 sm:size-6" aria-hidden />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <h4
                    id="delete-confirm-modal-title"
                    className="font-display text-lg font-bold text-verde-escuro-500 sm:text-xl"
                  >
                    Confirmar exclusão da conta?
                  </h4>
                  <p
                    id="delete-confirm-modal-desc"
                    className="text-sm leading-relaxed text-[#5d5d5d] sm:text-base"
                  >
                    Esta ação é permanente. Você perderá acesso ao álbum e não poderá
                    recuperar sua conta depois.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500 disabled:opacity-50"
                  aria-label="Fechar"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <div className="border-t border-red-100 px-5 py-4 sm:px-6">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-verde-escuro-500 sm:text-sm">
                  Será removido
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {items.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2.5 rounded-pill border border-red-100 bg-red-50/40 px-3 py-2 text-sm text-verde-escuro-500"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="font-medium leading-snug">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-red-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 sm:py-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="h-11 cursor-pointer rounded-pill px-6 text-sm font-medium text-verde-escuro-400 transition-colors hover:text-verde-escuro-500 disabled:opacity-60 sm:h-12 sm:px-8 sm:text-base"
                >
                  Cancelar
                </button>
                <Button
                  type="button"
                  size="md"
                  loading={loading}
                  onClick={onConfirm}
                  className="w-full cursor-pointer bg-red-600 px-6 text-white hover:bg-red-700 sm:w-auto sm:px-8"
                >
                  Sim, excluir minha conta
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
