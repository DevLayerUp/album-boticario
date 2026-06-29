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
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { stickerTextToPlain } from "@/lib/sticker-text-format";
import { StickerFormattedText } from "@/components/sticker/sticker-formatted-text";
import { RarityBadge } from "./rarity-badge";
import { StickerThumb } from "./sticker-thumb";
import type { Sticker } from "./types";

type RarityRow = NonNullable<Sticker["rarities"]>;

function normalizeSticker(raw: Sticker & { rarities?: RarityRow | RarityRow[] | null }): Sticker {
  const rarities = Array.isArray(raw.rarities) ? (raw.rarities[0] ?? null) : (raw.rarities ?? null);
  return { ...raw, rarities };
}

function stickerNameColor(slug?: string | null) {
  if (slug === "super_rare") return "#b57d02";
  if (slug === "rare") return "#09357a";
  return "var(--color-verde-escuro-500)";
}

interface StickerAutocompleteProps {
  value: Sticker | null;
  onChange: (sticker: Sticker | null) => void;
  placeholder?: string;
  disabled?: boolean;
  inputId?: string;
  /** Layout da seleção — hero exibe preview grande (modal de troca). */
  selectionLayout?: "inline" | "hero";
  onStickerPicked?: (sticker: Sticker) => void | Promise<void>;
  resetOnSelect?: boolean;
}

export function StickerAutocomplete({
  value,
  onChange,
  placeholder = "Digite o nome da figurinha…",
  disabled = false,
  inputId,
  selectionLayout = "inline",
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
    setQuery(stickerTextToPlain(sticker.name));
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
          top: dropdownRect.bottom + 10,
          left: dropdownRect.left,
          width: dropdownRect.width,
          zIndex: 110,
        }}
        className="max-h-[min(280px,45dvh)] overflow-y-auto rounded-block border border-verde-200/90 bg-surface p-1.5 shadow-[0_12px_40px_rgba(13,102,50,0.14)] ring-1 ring-verde-100 [scrollbar-width:thin] sm:max-h-[min(320px,50dvh)] sm:rounded-card sm:p-2 sm:shadow-[0_16px_48px_rgba(13,102,50,0.14)]"
      >
        {loading && results.length === 0 ? (
          <li className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-verde-escuro-300">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Buscando figurinhas…
          </li>
        ) : null}
        {fetchError ? (
          <li className="px-4 py-4 text-center text-sm text-red-600">{fetchError}</li>
        ) : null}
        {!loading && !fetchError && results.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-verde-escuro-300">
            Nenhuma figurinha encontrada.
          </li>
        ) : null}
        {results.map((sticker, index) => {
          const slug = sticker.rarities?.slug ?? "common";
          const isActive = highlight === index || value?.id === sticker.id;
          return (
            <li
              key={sticker.id}
              id={`${listId}-option-${sticker.id}`}
              role="option"
              aria-selected={isActive}
              className="py-0.5"
            >
              <button
                type="button"
                onMouseEnter={() => setHighlight(index)}
                onClick={() => void select(sticker)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-150 sm:gap-3 sm:rounded-2xl sm:px-2.5 sm:py-2.5",
                  isActive
                    ? "bg-verde-100 ring-1 ring-verde-300/80"
                    : "hover:bg-verde-50",
                )}
              >
                <StickerThumb sticker={sticker} width={52} height={74} />
                <div className="min-w-0 flex-1">
                  <RarityBadge
                    name={sticker.rarities?.name ?? "Comum"}
                    slug={slug}
                    colorHex={sticker.rarities?.color_hex}
                    className="mb-1.5 px-2.5 py-0.5 text-[9px] normal-case sm:text-[10px]"
                  />
                  <p
                    className="line-clamp-2 font-display text-[13px] font-bold leading-snug sm:text-sm"
                    style={{ color: stickerNameColor(slug) }}
                  >
                    <StickerFormattedText text={sticker.name} />
                  </p>
                </div>
                {isActive ? (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-verde-escuro-500 text-white">
                    <Check size={14} aria-hidden />
                  </span>
                ) : (
                  <span className="size-7 shrink-0" aria-hidden />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  const showHeroSelection = value && !resetOnSelect && selectionLayout === "hero";
  const showInlineSelection = value && !resetOnSelect && selectionLayout === "inline";

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-verde-escuro-300 sm:left-4 sm:size-[18px]"
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
          className="w-full rounded-pill border border-verde-200 bg-surface py-2.5 pl-10 pr-10 text-sm text-verde-escuro-capa shadow-sm outline-none transition-[border-color,box-shadow] focus:border-verde-500 focus:ring-2 focus:ring-verde-500/20 disabled:opacity-60 sm:py-3 sm:pl-11 sm:pr-11"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-verde-300" aria-hidden />
          ) : query || value ? (
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="pointer-events-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-verde-escuro-300 transition-colors hover:bg-verde-100 hover:text-verde-escuro-500"
              aria-label="Limpar busca"
            >
              <X size={15} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {typeof document !== "undefined" && dropdown ? createPortal(dropdown, document.body) : null}

      <AnimatePresence mode="wait">
        {showHeroSelection ? (
          <motion.div
            key={value.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="rounded-block border border-verde-200 bg-gradient-to-b from-verde-100/80 to-surface px-3 py-4 sm:rounded-card sm:px-4 sm:py-5 lg:px-5"
          >
            <p className="text-center text-[9px] font-bold uppercase tracking-[0.12em] text-verde-escuro-400 sm:text-[10px] sm:tracking-[0.14em]">
              Figurinha selecionada
            </p>
            <div className="mt-3 flex flex-col items-center gap-2.5 sm:mt-4 sm:gap-3">
              <StickerThumb sticker={value} width={100} height={143} />
              <RarityBadge
                name={value.rarities?.name ?? "Comum"}
                slug={value.rarities?.slug ?? "common"}
                colorHex={value.rarities?.color_hex}
              />
              <p
                className="max-w-[240px] text-center font-display text-base font-bold leading-tight sm:max-w-[260px] sm:text-lg lg:text-xl"
                style={{ color: stickerNameColor(value.rarities?.slug) }}
              >
                <StickerFormattedText text={value.name} />
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showInlineSelection ? (
        <div className="flex items-center gap-3 rounded-card border border-verde-200 bg-verde-100/50 px-3 py-2.5">
          <StickerThumb sticker={value} width={56} height={80} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-verde-escuro-500">
              Selecionada
            </p>
            <p className="truncate text-sm font-semibold text-verde-escuro-capa">
              <StickerFormattedText text={value.name} />
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
