import { Star, ThumbsUp, Trophy } from "lucide-react";
import { rarityTheme } from "@/lib/rarity";
import { cn } from "@/lib/utils";

interface RarityBadgeProps {
  name: string;
  slug: string;
  colorHex?: string | null;
  className?: string;
}

function RarityIcon({ slug, className }: { slug: string; className?: string }) {
  if (slug === "super_rare") {
    return <Trophy className={className} size={16} strokeWidth={2} aria-hidden />;
  }
  if (slug === "rare") {
    return <Star className={className} size={11} strokeWidth={2} aria-hidden />;
  }
  return <ThumbsUp className={className} size={10} strokeWidth={2} aria-hidden />;
}

export function RarityBadge({ name, slug, colorHex, className }: RarityBadgeProps) {
  const theme = rarityTheme(slug, colorHex);
  const { badge } = theme;
  const label =
    slug === "super_rare" ? "Super Rara" : slug === "rare" ? "Rara" : name;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:gap-2 sm:px-3.5 sm:text-[11px] 2xl:gap-2.5 2xl:px-4 2xl:py-1 2xl:text-xs",
        className,
      )}
      style={{
        color: badge.text,
        background:
          badge.kind === "gradient"
            ? `linear-gradient(to right, ${badge.gradientFrom}, ${badge.gradientTo})`
            : badge.background,
        boxShadow: badge.shadow,
      }}
    >
      <RarityIcon slug={slug} className="2xl:scale-110" />
      {label}
    </span>
  );
}
