import type { SupabaseClient } from "@supabase/supabase-js";
import { computeRankingBreakdown, type RankingScoreBreakdown } from "@/lib/ranking";

export interface ProfileSettings {
  id: string;
  display_name: string | null;
  email: string;
  sticker_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  created_at: string;
  show_in_ranking: boolean;
  notify_new_packs: boolean;
  notify_trades: boolean;
  notify_marketing: boolean;
  language: string;
  timezone: string;
}

export interface ProfileStats {
  packs_opened: number;
  stickers_count: number;
  score: number;
  score_breakdown: RankingScoreBreakdown;
}

export interface ProfilePageData {
  profile: ProfileSettings;
  stats: ProfileStats;
}

export function formatShortDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Colecionador";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export function formatMemberSince(dateIso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
    new Date(dateIso),
  );
}

export type ProfileAvatarVariant = "sticker" | "photo";

export function resolveProfileAvatar(profile: {
  sticker_url: string | null;
  avatar_url: string | null;
}): { src: string; variant: ProfileAvatarVariant } | null {
  if (profile.sticker_url) {
    return { src: profile.sticker_url, variant: "sticker" };
  }
  if (profile.avatar_url) {
    return { src: profile.avatar_url, variant: "photo" };
  }
  return null;
}

export async function fetchProfilePageData(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<ProfilePageData> {
  const [
    profileRes,
    stickersRes,
    packsRes,
    albumRes,
    slotsRes,
    missionsRes,
    tradesRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, display_name, sticker_url, avatar_url, bio, phone, created_at, show_in_ranking, notify_new_packs, notify_trades, notify_marketing, language, timezone",
      )
      .eq("id", userId)
      .single(),
    supabase
      .from("user_stickers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("quantity", 0),
    supabase
      .from("packs")
      .select("opened_at")
      .eq("user_id", userId),
    supabase.from("user_album").select("id").eq("user_id", userId),
    supabase.from("album_slots").select("id", { count: "exact", head: true }),
    supabase
      .from("user_missions")
      .select("completed_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null),
    supabase
      .from("trade_requests")
      .select("requester_id, receiver_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`),
  ]);

  if (profileRes.error) throw new Error(profileRes.error.message);

  const totalSlots = Math.max(slotsRes.count ?? 1, 1);
  const filled_slots = albumRes.data?.length ?? 0;
  const album_pct = Math.round((filled_slots / totalSlots) * 100);
  const packs_opened =
    packsRes.data?.filter((p) => p.opened_at != null).length ?? 0;
  const missions_completed = missionsRes.data?.length ?? 0;
  const trades_accepted = tradesRes.data?.length ?? 0;

  const scoreInput = {
    filled_slots,
    album_pct,
    packs_opened,
    missions_completed,
    trades_accepted,
  };
  const score_breakdown = computeRankingBreakdown(scoreInput);

  const row = profileRes.data;

  return {
    profile: {
      id: row.id,
      display_name: row.display_name,
      email,
      sticker_url: row.sticker_url,
      avatar_url: row.avatar_url,
      bio: row.bio ?? null,
      phone: row.phone ?? null,
      created_at: row.created_at,
      show_in_ranking: row.show_in_ranking ?? true,
      notify_new_packs: row.notify_new_packs ?? true,
      notify_trades: row.notify_trades ?? true,
      notify_marketing: row.notify_marketing ?? true,
      language: row.language ?? "pt-BR",
      timezone: row.timezone ?? "America/Sao_Paulo",
    },
    stats: {
      packs_opened,
      stickers_count: stickersRes.count ?? 0,
      score: score_breakdown.score,
      score_breakdown,
    },
  };
}
