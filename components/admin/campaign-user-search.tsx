"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import type { CampaignUserSearchResult } from "@/lib/email/campaign-user-search";

function formatUserLabel(user: CampaignUserSearchResult): string {
  const name = user.display_name ?? user.username ?? "Sem nome";
  return `${name} · ${user.email}`;
}

interface CampaignUserSearchProps {
  value: CampaignUserSearchResult | null;
  onChange: (user: CampaignUserSearchResult | null) => void;
  disabled?: boolean;
}

export function CampaignUserSearch({
  value,
  onChange,
  disabled,
}: CampaignUserSearchProps) {
  const [query, setQuery] = useState(value ? formatUserLabel(value) : "");
  const [results, setResults] = useState<CampaignUserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(formatUserLabel(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/email-campaigns/users-search?q=${encodeURIComponent(term.trim())}`,
      );
      const data = await res.json();
      setResults(res.ok ? data : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (value && query === formatUserLabel(value)) return;

    const timer = setTimeout(() => {
      void search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search, value]);

  function handleSelect(user: CampaignUserSearchResult) {
    onChange(user);
    setQuery(formatUserLabel(user));
    setOpen(false);
    setResults([]);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative mt-2">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null);
            setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Buscar por nome ou e-mail…"
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-9 text-sm disabled:opacity-50"
          autoComplete="off"
        />
        {(loading || value) && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Limpar usuário"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => handleSelect(user)}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">
                  {user.display_name ?? user.username ?? "Sem nome"}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && (
        <p className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500 shadow-lg">
          Nenhum usuário encontrado.
        </p>
      )}
    </div>
  );
}

export { formatUserLabel };
