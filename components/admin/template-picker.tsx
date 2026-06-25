"use client";

import { ALBUM_TEMPLATES, ALBUM_GRID_CARD, type TemplateId } from "@/lib/album-templates";

interface TemplatePickerProps {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}

/** Small visual preview for each template */
function TemplatePreview({ id, selected }: { id: TemplateId; selected: boolean }) {
  const base  = selected ? "bg-[#D6E44A]/70" : "bg-gray-200";
  const empty = selected ? "bg-[#1A5C35]/20" : "bg-gray-100";

  if (id === "profile") {
    return (
      <div className="flex items-center justify-center" style={{ width: 52, height: 52 }}>
        <div
          className={`rounded-sm ${base}`}
          style={{ width: 28, aspectRatio: "400/550" }}
        />
      </div>
    );
  }

  if (id === "social") {
    return (
      <div className="flex flex-col items-center justify-center gap-1" style={{ width: 52, height: 52 }}>
        <div className={`h-7 w-8 rounded-[40%] ${base}`} />
        <div className={`h-1.5 w-8 rounded-sm ${empty}`} />
        <div className="flex gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`size-1.5 rounded-full ${base}`} />
          ))}
        </div>
      </div>
    );
  }

  if (id === "title3") {
    return (
      <div className="flex flex-col gap-1" style={{ width: 52, height: 52 }}>
        {/* Title bar */}
        <div className={`h-2 w-4/5 rounded-sm ${base}`} />
        {/* Text lines */}
        <div className={`h-1 w-full rounded-sm ${empty}`} />
        <div className={`h-1 w-3/4 rounded-sm ${empty}`} />
        {/* 3 cards in a row */}
        <div className="mt-auto flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 rounded-sm ${base}`} style={{ aspectRatio: "16/23" }} />
          ))}
        </div>
      </div>
    );
  }

  if (id === "grid6") {
    return (
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: "repeat(3, 1fr)", width: 52, height: 52 }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`rounded-sm ${base}`} style={{ aspectRatio: "16/23" }} />
        ))}
      </div>
    );
  }

  if (id === "tri3") {
    return (
      <div className="flex items-center gap-0.5" style={{ width: 52, height: 52 }}>
        <div className={`w-[42%] self-center rounded-sm ${base}`} style={{ aspectRatio: "199/284" }} />
        <div className="flex flex-1 flex-col justify-center gap-0.5">
          <div className={`flex-1 rounded-sm ${base}`} />
          <div className={`flex-1 rounded-sm ${base}`} />
        </div>
      </div>
    );
  }

  // "3x3" — 9 cards 160×229 (Figma 360:147)
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: "repeat(3, 1fr)", width: 52, height: 52 }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-sm ${base}`}
          style={{ aspectRatio: `${ALBUM_GRID_CARD.width}/${ALBUM_GRID_CARD.height}` }}
        />
      ))}
    </div>
  );
}

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
      {ALBUM_TEMPLATES.map((tpl) => {
        const active = value === tpl.id;
        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onChange(tpl.id)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-150 ${
              active
                ? "border-[#1A5C35] bg-[#1A5C35]/8 shadow-md"
                : "border-gray-200 hover:border-[#1A5C35]/40 hover:bg-gray-50"
            }`}
          >
            <TemplatePreview id={tpl.id} selected={active} />
            <div className="text-center">
              <p className={`text-xs font-semibold ${active ? "text-[#1A5C35]" : "text-gray-600"}`}>
                {tpl.label}
              </p>
              <p className="text-[10px] text-gray-400">
                {tpl.id === "profile"
                  ? "figurinha do usuário"
                  : tpl.id === "social"
                    ? "imagem + texto + redes"
                    : `${tpl.total} slot${tpl.total !== 1 ? "s" : ""}`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
