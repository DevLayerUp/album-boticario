"use client";

import { Button } from "@/components/ui/button";

interface PerfilFormActionsProps {
  saving?: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
}

export function PerfilFormActions({
  saving,
  onCancel,
  onSave,
  saveLabel = "Salvar alterações",
}: PerfilFormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-6 sm:pt-6">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="h-11 rounded-pill px-6 text-sm font-medium text-verde-300 transition-colors hover:text-verde-400 disabled:opacity-60 sm:h-auto sm:px-10 sm:text-base"
      >
        Cancelar
      </button>
      <Button
        type="button"
        variant="secondary"
        size="md"
        loading={saving}
        onClick={onSave}
        className="w-full px-6 sm:w-auto sm:px-10"
      >
        {saveLabel}
      </Button>
    </div>
  );
}
