"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline, Link, Unlink, List, ListOrdered,
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

function normalizeExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

function findAnchor(node: Node | null, root: HTMLElement | null): HTMLAnchorElement | null {
  let current: Node | null = node;
  while (current && current !== root) {
    if (current instanceof HTMLAnchorElement) return current;
    current = current.parentNode;
  }
  return null;
}

function decorateExternalLinks(root: HTMLElement) {
  root.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") ?? "";
    if (/^(javascript|data|vbscript):/i.test(href)) {
      anchor.replaceWith(...Array.from(anchor.childNodes));
      return;
    }
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  });
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escreva o conteúdo informativo aqui…",
  className = "",
  minHeight = 280,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const isInternalUpdate = useRef(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [hasExistingLink, setHasExistingLink] = useState(false);

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

  function restoreSelection() {
    const range = savedRange.current;
    if (!range) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function closeLinkPanel() {
    setLinkOpen(false);
    setLinkError("");
    editorRef.current?.focus();
  }

  function openLinkPanel() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const range =
      editor && selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)
        ? selection.getRangeAt(0).cloneRange()
        : null;

    savedRange.current = range;
    const anchor = range
      ? findAnchor(range.commonAncestorContainer, editor) ?? findAnchor(range.startContainer, editor)
      : null;

    if (anchor) {
      setLinkUrl(anchor.getAttribute("href") ?? "");
      setHasExistingLink(true);
      setLinkError("");
    } else if (!range || range.collapsed) {
      setLinkUrl("");
      setHasExistingLink(false);
      setLinkError("Selecione um trecho do texto para aplicar o link.");
    } else {
      setLinkUrl("");
      setHasExistingLink(false);
      setLinkError("");
    }

    setLinkOpen(true);
    requestAnimationFrame(() => linkInputRef.current?.focus());
  }

  function applyLink() {
    const editor = editorRef.current;
    const href = normalizeExternalUrl(linkUrl);
    if (!href) {
      setLinkError("Informe uma URL válida, como https://exemplo.com");
      return;
    }
    if (!editor) return;

    const existing = savedRange.current
      ? findAnchor(savedRange.current.commonAncestorContainer, editor)
        ?? findAnchor(savedRange.current.startContainer, editor)
      : null;

    if (existing) {
      existing.setAttribute("href", href);
      decorateExternalLinks(editor);
    } else {
      if (!savedRange.current || savedRange.current.collapsed) {
        setLinkError("Selecione um trecho do texto para aplicar o link.");
        return;
      }
      restoreSelection();
      editor.focus();
      restoreSelection();
      document.execCommand("createLink", false, href);
      decorateExternalLinks(editor);
    }

    handleInput();
    closeLinkPanel();
  }

  function removeLink() {
    restoreSelection();
    document.execCommand("unlink", false);
    handleInput();
    closeLinkPanel();
  }

  useEffect(() => {
    if (!linkOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeLinkPanel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [linkOpen]);

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

        <ToolbarBtn onClick={openLinkPanel} title="Inserir link" active={linkOpen}>
          <Link size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec("removeFormat")} title="Remover formatação">
          <RemoveFormatting size={14} />
        </ToolbarBtn>
      </div>

      {linkOpen ? (
        <div className="flex flex-col gap-2 border-b border-border bg-white px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => { setLinkUrl(e.target.value); setLinkError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
              placeholder="https://exemplo.com"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-gb-green"
            />
            <button
              type="button"
              onClick={applyLink}
              className="rounded-lg bg-gb-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-gb-green-dark"
            >
              Aplicar
            </button>
            {hasExistingLink ? (
              <button
                type="button"
                onClick={removeLink}
                title="Remover link"
                aria-label="Remover link"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600"
              >
                <Unlink size={14} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={closeLinkPanel}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
          {linkError ? (
            <p className="text-xs text-red-500">{linkError}</p>
          ) : (
            <p className="text-xs text-gray-400">
              Selecione um trecho e cole a URL. O link abre em uma nova aba.
            </p>
          )}
        </div>
      ) : null}

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
          [contenteditable] a {
            color: #0d6632;
            text-decoration: underline;
            text-underline-offset: 0.15em;
          }
        `}</style>
      </div>
    </div>
  );
}
