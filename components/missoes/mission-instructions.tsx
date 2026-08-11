"use client";

import { getAmbassadorRegulamentoUrl } from "@/lib/ambassador-program";
import { isAmbassadorMission } from "@/lib/missions";
import { cn } from "@/lib/utils";

interface MissionInstructionsProps {
  title: string;
  text: string;
  className?: string;
}

/**
 * Renderiza instruções; no Desafio GB, transforma "regulamento" em link.
 */
export function MissionInstructions({
  title,
  text,
  className,
}: MissionInstructionsProps) {
  const isAmbassador = isAmbassadorMission({ title });
  const regulamentoUrl = isAmbassador ? getAmbassadorRegulamentoUrl() : null;

  if (!isAmbassador || !regulamentoUrl || !text.includes("regulamento")) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(/(regulamento)/i);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.toLowerCase() === "regulamento") {
          return (
            <a
              key={`reg-${index}`}
              href={regulamentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "font-semibold text-[#71410a] underline decoration-[#d2a309] underline-offset-2",
                "transition-opacity hover:opacity-80",
              )}
            >
              {part}
            </a>
          );
        }
        return <span key={`txt-${index}`}>{part}</span>;
      })}
    </span>
  );
}
