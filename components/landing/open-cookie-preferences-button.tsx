"use client";

import { openCookiePreferences } from "@/lib/cookie-consent";

export function OpenCookiePreferencesButton({
  className = "font-medium text-verde-500 underline hover:text-verde-escuro-500",
  children = "Gerenciar cookies",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className={className}
    >
      {children}
    </button>
  );
}
