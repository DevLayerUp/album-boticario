import {
  formatScientificName,
  parseStickerFormattedText,
} from "@/lib/sticker-text-format";
import { cn } from "@/lib/utils";

interface StickerFormattedTextProps {
  text: string;
  as?: "span" | "p";
  className?: string;
  /** Nome comum em maiúsculas (tags do álbum); nome científico permanece em caixa correta. */
  uppercasePlain?: boolean;
}

export function StickerFormattedText({
  text,
  as: Component = "span",
  className,
  uppercasePlain = false,
}: StickerFormattedTextProps) {
  const segments = parseStickerFormattedText(text);
  if (!segments.length) return null;

  return (
    <Component className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "scientific") {
          const formatted = formatScientificName(segment.value);
          if (!formatted) return null;
          return (
            <em
              key={`sci-${index}`}
              className="font-normal italic normal-case"
            >
              ({formatted})
            </em>
          );
        }

        if (!segment.value) return null;

        return (
          <span
            key={`txt-${index}`}
            className={uppercasePlain ? "uppercase" : undefined}
          >
            {segment.value}
          </span>
        );
      })}
    </Component>
  );
}

/** Variante compacta para tags estreitas (line-clamp no pai). */
export function StickerFormattedNameTag({
  text,
  className,
  uppercasePlain = true,
}: {
  text: string;
  className?: string;
  uppercasePlain?: boolean;
}) {
  return (
    <StickerFormattedText
      text={text}
      className={cn("inline", className)}
      uppercasePlain={uppercasePlain}
    />
  );
}
