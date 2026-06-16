import { Star, ThumbsUp, Trophy } from "lucide-react";
import { rarityTheme } from "@/lib/rarity";
import { cn } from "@/lib/utils";

interface RarityBadgeProps {
  name: string;
  slug: string;
  colorHex?: string | null;
  className?: string;
}

function RarityIcon({ slug }: { slug: string }) {
  if (slug === "super_rare") {
    return <Trophy size={20} strokeWidth={2} aria-hidden />;
  }
  if (slug === "rare") {
    return <Star size={13} strokeWidth={2} aria-hidden />;
  }
  return <ThumbsUp size={12} strokeWidth={2} aria-hidden />;
}

export function RarityBadge({ name, slug, colorHex, className }: RarityBadgeProps) {
  const theme = rarityTheme(slug, colorHex);
  const { badge } = theme;
  const label =
    slug === "super_rare" ? "Super Rara" : slug === "rare" ? "Rara" : name;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-pill px-4 py-1 text-xs font-semibold uppercase tracking-wide",
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
      <RarityIcon slug={slug} />
      {label}
    </span>
  );
}
