"use client";

import { cn } from "@/lib/utils";

const TRACK_W = 46;
const TRACK_H = 23;
const THUMB = 19;
const INSET = 2;

interface PerfilToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function PerfilToggle({
  checked,
  onChange,
  label,
  disabled,
}: PerfilToggleProps) {
  const thumbOnLeft = TRACK_W - THUMB - INSET;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-pill transition-colors duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        checked ? "bg-verde-500" : "bg-verde-200",
      )}
      style={{ width: TRACK_W, height: TRACK_H }}
    >
      <span
        aria-hidden
        className="absolute top-1/2 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-out"
        style={{
          width: THUMB,
          height: THUMB,
          left: checked ? thumbOnLeft : INSET,
          transform: "translateY(-50%)",
        }}
      />
    </button>
  );
}
