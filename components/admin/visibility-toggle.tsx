"use client";

import { Globe, Lock } from "lucide-react";

export function VisibilityToggle({
  value,
  onChange,
  publicDescription,
  privateDescription,
}: {
  value: boolean;
  onChange: (isPublic: boolean) => void;
  publicDescription: string;
  privateDescription: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        Visibilidade
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
            value ? "border-gb-green bg-gb-green/5" : "border-border hover:border-gray-300"
          }`}
        >
          <Globe size={16} className={value ? "text-gb-green" : "text-gray-400"} />
          <span className="mt-2 text-sm font-semibold text-gb-ink">Pública</span>
          <span className="mt-0.5 text-xs text-muted">{publicDescription}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
            !value ? "border-amber-400 bg-amber-50" : "border-border hover:border-gray-300"
          }`}
        >
          <Lock size={16} className={!value ? "text-amber-600" : "text-gray-400"} />
          <span className="mt-2 text-sm font-semibold text-gb-ink">Privada</span>
          <span className="mt-0.5 text-xs text-muted">{privateDescription}</span>
        </button>
      </div>
    </div>
  );
}
