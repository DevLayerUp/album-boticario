"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

interface CampaignEmailPreviewModalProps {
  open: boolean;
  title: string;
  htmlBody: string;
  onClose: () => void;
}

export function CampaignEmailPreviewModal({
  open,
  title,
  htmlBody,
  onClose,
}: CampaignEmailPreviewModalProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [subject, setSubject] = useState(title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setHtml(null);
      setError(null);
      return;
    }

    if (!htmlBody.trim()) {
      setError("Escreva o conteúdo do e-mail antes de visualizar o preview.");
      setHtml(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/admin/email-campaigns/preview-render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, html_body: htmlBody }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Erro ao gerar preview");
          setHtml(null);
          return;
        }
        setHtml(data.html);
        setSubject(data.subject);
      })
      .catch(() => {
        if (!cancelled) setError("Erro ao gerar preview");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, title, htmlBody]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-preview-title"
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Preview do e-mail
            </p>
            <h3 id="campaign-preview-title" className="mt-1 truncate text-base font-semibold text-gray-900">
              Assunto: {subject}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {loading && (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              Gerando preview…
            </div>
          )}

          {!loading && error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {!loading && html && (
            <iframe
              title="Preview do e-mail"
              srcDoc={html}
              className="mx-auto block h-[min(70vh,640px)] w-full max-w-[640px] rounded-xl border border-gray-200 bg-white shadow-sm"
              sandbox=""
            />
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-gray-500">
            Visualização com o mesmo layout dos e-mails transacionais. Imagens do cabeçalho
            carregam do site em produção.
          </p>
        </div>
      </div>
    </div>
  );
}
