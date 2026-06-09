"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Bold, Italic, Underline, Link, List, ListOrdered,
  Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

type ExecCmd =
  | "bold" | "italic" | "underline"
  | "insertUnorderedList" | "insertOrderedList"
  | "justifyLeft" | "justifyCenter" | "justifyRight"
  | "removeFormat";

function ToolbarBtn({
  onClick,
  title,
  children,
  active = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      aria-label={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors text-sm
        ${active
          ? "bg-gb-green text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gb-ink"
        }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escreva o conteúdo informativo aqui…",
  className = "",
  minHeight = 280,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value → editor (only when different to avoid cursor jump)
  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalUpdate.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const exec = useCallback((cmd: ExecCmd, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }, []);

  const handleInput = useCallback(() => {
    isInternalUpdate.current = true;
    onChange(editorRef.current?.innerHTML ?? "");
    // reset flag on next tick so effect doesn't overwrite
    requestAnimationFrame(() => { isInternalUpdate.current = false; });
  }, [onChange]);

  function insertHeading(tag: "h2" | "h3") {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    // Check if already inside that heading
    let node: Node | null = range.commonAncestorContainer;
    while (node && node !== editorRef.current) {
      if ((node as HTMLElement).tagName?.toLowerCase() === tag) {
        // Remove heading → replace with p
        document.execCommand("formatBlock", false, "p");
        return;
      }
      node = node.parentNode;
    }
    document.execCommand("formatBlock", false, tag);
    editorRef.current?.focus();
  }

  function insertLink() {
    const url = window.prompt("URL do link:");
    if (url) exec("bold"); // focus first
    if (url) document.execCommand("createLink", false, url);
    editorRef.current?.focus();
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-white focus-within:border-gb-green ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-gray-50/80 px-2 py-1.5">
        <ToolbarBtn onClick={() => exec("bold")} title="Negrito (Ctrl+B)">
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("italic")} title="Itálico (Ctrl+I)">
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("underline")} title="Sublinhado (Ctrl+U)">
          <Underline size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => insertHeading("h2")} title="Título H2">
          <Heading2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insertHeading("h3")} title="Subtítulo H3">
          <Heading3 size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Lista com marcadores">
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Lista numerada">
          <ListOrdered size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => exec("justifyLeft")} title="Alinhar à esquerda">
          <AlignLeft size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("justifyCenter")} title="Centralizar">
          <AlignCenter size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("justifyRight")} title="Alinhar à direita">
          <AlignRight size={14} />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={insertLink} title="Inserir link">
          <Link size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("removeFormat")} title="Remover formatação">
          <RemoveFormatting size={14} />
        </ToolbarBtn>
      </div>

      {/* Editable area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={(e) => {
            // Paste plain text to avoid inheriting external styles
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
          }}
          className="prose prose-sm max-w-none outline-none"
          style={{
            minHeight,
            padding: "12px 16px",
            overflowY: "auto",
          }}
          data-placeholder={placeholder}
        />
        {/* Placeholder (shown via CSS when empty) */}
        <style>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `}</style>
      </div>
    </div>
  );
}
