"use client";

import { useRef } from "react";
import { Italic } from "lucide-react";
import { StickerFormattedText } from "@/components/sticker/sticker-formatted-text";

interface StickerFormattedTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  rows?: number;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

export function StickerFormattedTextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  rows = 3,
  placeholder,
  hint,
  required,
}: StickerFormattedTextFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertScientificMarkup() {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end).trim();
    const markup = selected
      ? `{{sci|${selected}}}`
      : "{{sci|Gênero espécie}}";

    const next = `${value.slice(0, start)}${markup}${value.slice(end)}`.slice(
      0,
      maxLength,
    );
    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      if (!selected) {
        const innerStart = start + "{{sci|".length;
        const innerEnd = innerStart + "Gênero espécie".length;
        el.setSelectionRange(innerStart, innerEnd);
      } else {
        const cursor = start + markup.length;
        el.setSelectionRange(cursor, cursor);
      }
    });
  }

  const hasMarkup = value.includes("{{sci|");

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
        <button
          type="button"
          onClick={insertScientificMarkup}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-gb-green hover:bg-white hover:text-gb-green"
        >
          <Italic size={13} aria-hidden />
          Nome científico
        </button>
      </div>

      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gb-green focus:ring-1 focus:ring-gb-green"
      />

      <p className="mt-1 text-xs text-gray-500">
        {value.length}/{maxLength} caracteres
        {hint ? ` — ${hint}` : ""}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Use «Nome científico» para trechos em itálico, entre parênteses, com gênero
        em maiúscula e epíteto em minúscula (ex.:{" "}
        <code className="rounded bg-gray-100 px-1">{"{{sci|Ara chloropterus}}"}</code>
        ).
      </p>

      {hasMarkup && (
        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-gray-500">Pré-visualização</p>
          <StickerFormattedText text={value} className="text-sm text-gray-800" />
        </div>
      )}
    </div>
  );
}
