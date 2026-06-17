export const SOURCE_LABEL: Record<string, string> = {
  quiz: "Quiz",
  mission: "Missão",
  manual: "Bônus",
  admin_grant: "Admin",
};

export function formatPackDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatOpenedRelative(dateIso: string): string {
  const date = new Date(dateIso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
