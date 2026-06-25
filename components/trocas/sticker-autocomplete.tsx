"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StickerThumb } from "./sticker-thumb";
import type { Sticker } from "./types";

type RarityRow = NonNullable<Sticker["rarities"]>;

function normalizeSticker(raw: Sticker & { rarities?: RarityRow | RarityRow[] | null }): Sticker {
  const rarities = Array.isArray(raw.rarities) ? (raw.rarities[0] ?? null) : (raw.rarities ?? null);
  return { ...raw, rarities };
}

interface StickerAutocompleteProps {
  value: Sticker | null;
  onChange: (sticker: Sticker | null) => void;
  placeholder?: string;
  disabled?: boolean;
  inputId?: string;
  /** Ao selecionar uma figurinha (ex.: criar pedido direto). */
  onStickerPicked?: (sticker: Sticker) => void | Promise<void>;
  /** Limpa o campo após `onStickerPicked`. */
  resetOnSelect?: boolean;
}

export function StickerAutocomplete({
  value,
  onChange,
  placeholder = "Digite o nome da figurinha…",
  disabled = false,
  inputId,
  onStickerPicked,
  resetOnSelect = false,
}: StickerAutocompleteProps) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchStickers = useCallback(async (q: string) => {
    setLoading(true);
    setFetchError("");
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/trades/stickers?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setResults([]);
        setFetchError(
          typeof data?.error === "string"
            ? data.error
            : "Não foi possível carregar as figurinhas.",
        );
        return;
      }
      setResults(Array.isArray(data) ? data.map(normalizeSticker) : []);
      setHighlight(0);
    } catch {
      setResults([]);
      setFetchError("Não foi possível carregar as figurinhas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    setDropdownRect(inputRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchStickers(query);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, open, fetchStickers]);

  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open, results.length, query, updateDropdownPosition]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if ((target as Element).closest?.(`[data-sticker-autocomplete-list="${listId}"]`)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [listId]);

  async function select(sticker: Sticker) {
    onChange(sticker);
    setQuery(sticker.name);
    setOpen(false);
    if (onStickerPicked) {
      await onStickerPicked(sticker);
      if (resetOnSelect) {
        onChange(null);
        setQuery("");
        setResults([]);
      }
    }
  }

  function clear() {
    onChange(null);
    setQuery("");
    setFetchError("");
    setOpen(true);
    void fetchStickers("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[highlight]) {
      e.preventDefault();
      void select(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown =
    open && (loading || fetchError.length > 0 || results.length > 0 || query.trim().length > 0);

  const dropdown =
    showDropdown && dropdownRect ? (
      <ul
        id={listId}
        data-sticker-autocomplete-list={listId}
        role="listbox"
        style={{
          position: "fixed",
          top: dropdownRect.bottom + 8,
          left: dropdownRect.left,
          width: dropdownRect.width,
          zIndex: 10000,
        }}
        className="max-h-56 overflow-y-auto rounded-card border border-verde-200 bg-surface py-1 shadow-lg [scrollbar-width:thin]"
      >
        {loading && results.length === 0 ? (
          <li className="px-4 py-3 text-center text-sm text-verde-escuro-300">
            Buscando figurinhas…
          </li>
        ) : null}
        {fetchError ? (
          <li className="px-4 py-3 text-center text-sm text-red-600">{fetchError}</li>
        ) : null}
        {!loading && !fetchError && results.length === 0 ? (
          <li className="px-4 py-3 text-center text-sm text-verde-escuro-300">
            Nenhuma figurinha encontrada.
          </li>
        ) : null}
        {results.map((sticker, index) => (
          <li
            key={sticker.id}
            id={`${listId}-option-${sticker.id}`}
            role="option"
            aria-selected={value?.id === sticker.id || highlight === index}
          >
            <button
              type="button"
              onMouseEnter={() => setHighlight(index)}
              onClick={() => void select(sticker)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition-colors",
                highlight === index ? "bg-verde-100" : "hover:bg-verde-100/60",
                value?.id === sticker.id && "bg-verde-100/80",
              )}
            >
              <StickerThumb sticker={sticker} width={40} height={58} />
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-verde-escuro-capa">
                {sticker.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-verde-escuro-300"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showDropdown && results[highlight]
              ? `${listId}-option-${results[highlight].id}`
              : undefined
          }
          placeholder={placeholder}
          value={query}
          disabled={disabled}
          onChange={(e) => {
            onChange(null);
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            updateDropdownPosition();
            if (results.length === 0 && !fetchError) void fetchStickers(query);
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-pill border border-verde-200 bg-verde-100/30 py-2.5 pl-11 pr-10 text-sm outline-none transition-colors focus:border-verde-500 focus:bg-surface disabled:opacity-60"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-verde-300" aria-hidden />
          ) : query || value ? (
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="pointer-events-auto flex size-7 cursor-pointer items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500"
              aria-label="Limpar busca"
            >
              <X size={14} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {typeof document !== "undefined" && dropdown ? createPortal(dropdown, document.body) : null}

      {value && !resetOnSelect ? (
        <div className="flex items-center gap-3 rounded-card border border-verde-200 bg-verde-100/50 px-3 py-2.5">
          <StickerThumb sticker={value} width={52} height={74} selected />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-verde-escuro-500">
              Selecionada
            </p>
            <p className="truncate text-sm font-semibold text-verde-escuro-capa">{value.name}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
