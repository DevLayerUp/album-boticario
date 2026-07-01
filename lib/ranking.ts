import type { SupabaseClient } from "@supabase/supabase-js";
import { listAdminUserIds } from "@/lib/admin-users";

export interface RankingEntry {
  user_id: string;
  display_name: string;
  username: string | null;
  sticker_url: string | null;
  avatar_url: string | null;
  filled_slots: number;
  album_pct: number;
  total_slots: number;
  packs_opened: number;
  packs_unopened: number;
  missions_completed: number;
  trades_accepted: number;
  score: number;
  rank: number;
}

export interface LeaderboardResponse {
  total_slots: number;
  current_user_id: string;
  entries: RankingEntry[];
}

export interface RankingScoreInput {
  filled_slots: number;
  album_pct: number;
  packs_opened: number;
  missions_completed: number;
  trades_accepted: number;
}

/**
 * Pontuação composta do ranking:
 * - Álbum completo é o fator principal (slots colados + %)
 * - Missões e trocas dão bônus
 * - Menos pacotinhos abertos = mais eficiente = mais pontos
 */
export function computeRankingScore(input: RankingScoreInput): number {
  const {
    filled_slots,
    album_pct,
    packs_opened,
    missions_completed,
    trades_accepted,
  } = input;

  const albumScore = filled_slots * 100 + album_pct * 5;
  const missionBonus = missions_completed * 40;
  const tradeBonus = trades_accepted * 25;

  const efficiencyBonus =
    packs_opened === 0
      ? filled_slots * 2
      : Math.round((filled_slots / packs_opened) * 30);

  const packPenalty = packs_opened * 3;

  return Math.round(
    albumScore + missionBonus + tradeBonus + efficiencyBonus - packPenalty,
  );
}

function sortEntries(
  entries: Omit<RankingEntry, "rank">[],
): RankingEntry[] {
  return [...entries]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.filled_slots !== a.filled_slots) return b.filled_slots - a.filled_slots;
      if (a.packs_opened !== b.packs_opened) return a.packs_opened - b.packs_opened;
      if (b.missions_completed !== a.missions_completed) {
        return b.missions_completed - a.missions_completed;
      }
      return b.trades_accepted - a.trades_accepted;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function buildLeaderboard(
  admin: SupabaseClient,
  currentUserId: string,
): Promise<LeaderboardResponse> {
  const [profilesRes, slotsRes, albumRes, packsRes, missionsRes, tradesRes] =
    await Promise.all([
      admin
        .from("profiles")
        .select(
          "id, display_name, username, sticker_url, avatar_url, show_in_ranking",
        ),
      admin.from("album_slots").select("id", { count: "exact", head: true }),
      admin.from("user_album").select("user_id"),
      admin.from("packs").select("user_id, opened_at"),
      admin.from("user_missions").select("user_id, completed_at"),
      admin
        .from("trade_requests")
        .select("requester_id, receiver_id")
        .eq("status", "accepted"),
    ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);

  const adminUserIds = await listAdminUserIds(admin);
  const totalSlots = Math.max(slotsRes.count ?? 1, 1);

  const filledByUser = new Map<string, number>();
  for (const row of albumRes.data ?? []) {
    filledByUser.set(row.user_id, (filledByUser.get(row.user_id) ?? 0) + 1);
  }

  const openedByUser = new Map<string, number>();
  const unopenedByUser = new Map<string, number>();
  for (const row of packsRes.data ?? []) {
    if (row.opened_at) {
      openedByUser.set(row.user_id, (openedByUser.get(row.user_id) ?? 0) + 1);
    } else {
      unopenedByUser.set(
        row.user_id,
        (unopenedByUser.get(row.user_id) ?? 0) + 1,
      );
    }
  }

  const missionsByUser = new Map<string, number>();
  for (const row of missionsRes.data ?? []) {
    if (row.completed_at) {
      missionsByUser.set(
        row.user_id,
        (missionsByUser.get(row.user_id) ?? 0) + 1,
      );
    }
  }

  const tradesByUser = new Map<string, number>();
  for (const row of tradesRes.data ?? []) {
    tradesByUser.set(
      row.requester_id,
      (tradesByUser.get(row.requester_id) ?? 0) + 1,
    );
    tradesByUser.set(
      row.receiver_id,
      (tradesByUser.get(row.receiver_id) ?? 0) + 1,
    );
  }

  const entries = (profilesRes.data ?? [])
    .filter(
      (profile) =>
        profile.show_in_ranking !== false && !adminUserIds.has(profile.id),
    )
    .map((profile) => {
    const filled_slots = filledByUser.get(profile.id) ?? 0;
    const album_pct = Math.round((filled_slots / totalSlots) * 100);
    const packs_opened = openedByUser.get(profile.id) ?? 0;
    const packs_unopened = unopenedByUser.get(profile.id) ?? 0;
    const missions_completed = missionsByUser.get(profile.id) ?? 0;
    const trades_accepted = tradesByUser.get(profile.id) ?? 0;

    return {
      user_id: profile.id,
      display_name:
        profile.display_name ?? profile.username ?? "Colecionador",
      username: profile.username,
      sticker_url: profile.sticker_url,
      avatar_url: profile.avatar_url,
      filled_slots,
      album_pct,
      total_slots: totalSlots,
      packs_opened,
      packs_unopened,
      missions_completed,
      trades_accepted,
      score: computeRankingScore({
        filled_slots,
        album_pct,
        packs_opened,
        missions_completed,
        trades_accepted,
      }),
      rank: 0,
    };
  });

  return {
    total_slots: totalSlots,
    current_user_id: currentUserId,
    entries: sortEntries(entries),
  };
}
