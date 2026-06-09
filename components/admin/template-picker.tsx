"use client";

import { ALBUM_TEMPLATES, type TemplateId } from "@/lib/album-templates";

interface TemplatePickerProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {ALBUM_TEMPLATES.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          onClick={() => onChange(tpl.id)}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-150 ${
            value === tpl.id
              ? "border-gb-green bg-gb-green/8 shadow-md"
              : "border-gray-200 hover:border-gb-green/40 hover:bg-gray-50"
          }`}
        >
          {/* Mini grid preview */}
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${tpl.cols}, 1fr)`, width: 44, height: 44 * (tpl.rows / tpl.cols) }}
          >
            {Array.from({ length: tpl.total }).map((_, i) => (
              <div
                key={i}
                className={`rounded-sm ${
                  value === tpl.id ? "bg-gb-green/50" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Label */}
          <div className="text-center">
            <p className={`text-xs font-semibold ${value === tpl.id ? "text-gb-green-dark" : "text-gray-600"}`}>
              {tpl.label}
            </p>
            <p className="text-[10px] text-gray-400">{tpl.total} slots</p>
          </div>
        </button>
      ))}
    </div>
  );
}
