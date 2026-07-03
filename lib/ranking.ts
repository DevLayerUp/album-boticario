import type { SupabaseClient } from "@supabase/supabase-js";
import { buildRankingMissionCountsFromActivity } from "@/lib/missions";
import { loadRankingScoreInput } from "@/lib/sync-ranking-score";
import { fetchAllPages } from "@/lib/supabase/fetch-all-pages";
import {
  RANKING_ALBUM_PCT_MULTIPLIER,
  RANKING_EFFICIENCY_MULTIPLIER,
  RANKING_MISSION_BONUS,
  RANKING_PACK_PENALTY,
  RANKING_SLOT_POINTS,
  RANKING_TRADE_BONUS,
  RANKING_ZERO_PASTE_EFFICIENCY_BONUS,
} from "@/lib/ranking-constants";
import { listAdminUserIds } from "@/lib/admin-users";

export {
  RANKING_ALBUM_PCT_MULTIPLIER,
  RANKING_EFFICIENCY_MULTIPLIER,
  RANKING_MISSION_BONUS,
  RANKING_PACK_PENALTY,
  RANKING_SLOT_POINTS,
  RANKING_TRADE_BONUS,
  RANKING_ZERO_PASTE_EFFICIENCY_BONUS,
} from "@/lib/ranking-constants";

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
  /** Card "Sua posição" — sempre do usuário logado, com % do álbum igual à página do álbum. */
  current_user_entry: RankingEntry | null;
  entries: RankingEntry[];
}

export interface RankingScoreInput {
  filled_slots: number;
  album_pct: number;
  packs_opened: number;
  missions_completed: number;
  trades_accepted: number;
}

export interface RankingScoreBreakdown {
  album_score: number;
  mission_bonus: number;
  trade_bonus: number;
  efficiency_bonus: number;
  pack_penalty: number;
  score: number;
}

/**
 * Pontuação composta do ranking:
 * - Álbum completo é o fator principal (slots colados + %)
 * - Missões e trocas dão bônus fixos
 * - Menos pacotinhos abertos = mais eficiente = mais pontos
 * - Penalidade por pacote aberto só quando já há figurinhas coladas
 * - Score mínimo exibido: 0
 */
export function computeRankingBreakdown(
  input: RankingScoreInput,
): RankingScoreBreakdown {
  const {
    filled_slots,
    album_pct,
    packs_opened,
    missions_completed,
    trades_accepted,
  } = input;

  const album_score = filled_slots * RANKING_SLOT_POINTS + album_pct * RANKING_ALBUM_PCT_MULTIPLIER;
  const mission_bonus = missions_completed * RANKING_MISSION_BONUS;
  const trade_bonus = trades_accepted * RANKING_TRADE_BONUS;

  const efficiency_bonus =
    packs_opened === 0
      ? filled_slots * RANKING_ZERO_PASTE_EFFICIENCY_BONUS
      : Math.round((filled_slots / packs_opened) * RANKING_EFFICIENCY_MULTIPLIER);

  const pack_penalty =
    filled_slots > 0 ? packs_opened * RANKING_PACK_PENALTY : 0;

  const raw =
    album_score + mission_bonus + trade_bonus + efficiency_bonus - pack_penalty;

  return {
    album_score,
    mission_bonus,
    trade_bonus,
    efficiency_bonus,
    pack_penalty,
    score: Math.max(0, Math.round(raw)),
  };
}

export function computeRankingScore(input: RankingScoreInput): number {
  return computeRankingBreakdown(input).score;
}

/** Mesma fórmula da página do álbum: coladas ÷ total de slots. */
export function computeAlbumProgressPct(
  filled_slots: number,
  total_slots: number,
): number {
  if (total_slots <= 0) return 0;
  return Math.round((filled_slots / total_slots) * 100);
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

async function buildCurrentUserRankingEntry(
  admin: SupabaseClient,
  userId: string,
  sorted: RankingEntry[],
  totalSlots: number,
): Promise<RankingEntry | null> {
  const accurate = await loadRankingScoreInput(admin, userId);
  const album_pct = computeAlbumProgressPct(accurate.filled_slots, totalSlots);
  const inList = sorted.find((entry) => entry.user_id === userId);

  if (inList) {
    return {
      ...inList,
      filled_slots: accurate.filled_slots,
      album_pct,
      total_slots: totalSlots,
      packs_opened: accurate.packs_opened,
      missions_completed: accurate.missions_completed,
      trades_accepted: accurate.trades_accepted,
    };
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select(
      "display_name, username, sticker_url, avatar_url, ranking_score, ranking_score_updated_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) return null;

  const score = profile.ranking_score_updated_at
    ? (profile.ranking_score ?? 0)
    : computeRankingScore(accurate);

  const rank =
    sorted.filter(
      (entry) =>
        entry.score > score ||
        (entry.score === score && entry.filled_slots > accurate.filled_slots),
    ).length + 1;

  return {
    user_id: userId,
    display_name: profile.display_name ?? profile.username ?? "Colecionador",
    username: profile.username,
    sticker_url: profile.sticker_url,
    avatar_url: profile.avatar_url,
    filled_slots: accurate.filled_slots,
    album_pct: computeAlbumProgressPct(accurate.filled_slots, totalSlots),
    total_slots: totalSlots,
    packs_opened: accurate.packs_opened,
    packs_unopened: 0,
    missions_completed: accurate.missions_completed,
    trades_accepted: accurate.trades_accepted,
    score,
    rank,
  };
}

export async function buildLeaderboard(
  admin: SupabaseClient,
  currentUserId: string,
): Promise<LeaderboardResponse> {
  const [profiles, slotsRes, albumRows, packRows, missionsByUser, tradeRows] =
    await Promise.all([
      fetchAllPages<{
        id: string;
        display_name: string | null;
        username: string | null;
        sticker_url: string | null;
        avatar_url: string | null;
        show_in_ranking: boolean;
        ranking_score: number;
        ranking_score_updated_at: string | null;
      }>((from, to) =>
        admin
          .from("profiles")
          .select(
            "id, display_name, username, sticker_url, avatar_url, show_in_ranking, ranking_score, ranking_score_updated_at",
          )
          .range(from, to),
      ),
      admin.from("album_slots").select("id", { count: "exact", head: true }),
      fetchAllPages<{ user_id: string }>((from, to) =>
        admin.from("user_album").select("user_id").range(from, to),
      ),
      fetchAllPages<{ user_id: string; opened_at: string | null }>((from, to) =>
        admin.from("packs").select("user_id, opened_at").range(from, to),
      ),
      buildRankingMissionCountsFromActivity(admin),
      fetchAllPages<{ requester_id: string; receiver_id: string }>((from, to) =>
        admin
          .from("trade_requests")
          .select("requester_id, receiver_id")
          .eq("status", "accepted")
          .range(from, to),
      ),
    ]);

  const adminUserIds = await listAdminUserIds(admin);
  const totalSlots = Math.max(slotsRes.count ?? 1, 1);

  const filledByUser = new Map<string, number>();
  for (const row of albumRows) {
    filledByUser.set(row.user_id, (filledByUser.get(row.user_id) ?? 0) + 1);
  }

  const openedByUser = new Map<string, number>();
  const unopenedByUser = new Map<string, number>();
  for (const row of packRows) {
    if (row.opened_at) {
      openedByUser.set(row.user_id, (openedByUser.get(row.user_id) ?? 0) + 1);
    } else {
      unopenedByUser.set(
        row.user_id,
        (unopenedByUser.get(row.user_id) ?? 0) + 1,
      );
    }
  }

  const missionsByUserMap = missionsByUser;

  const tradesByUser = new Map<string, number>();
  for (const row of tradeRows) {
    tradesByUser.set(
      row.requester_id,
      (tradesByUser.get(row.requester_id) ?? 0) + 1,
    );
    tradesByUser.set(
      row.receiver_id,
      (tradesByUser.get(row.receiver_id) ?? 0) + 1,
    );
  }

  const entries = profiles
    .filter(
      (profile) =>
        profile.show_in_ranking !== false && !adminUserIds.has(profile.id),
    )
    .map((profile) => {
    const filled_slots = filledByUser.get(profile.id) ?? 0;
    const album_pct = computeAlbumProgressPct(filled_slots, totalSlots);
    const packs_opened = openedByUser.get(profile.id) ?? 0;
    const packs_unopened = unopenedByUser.get(profile.id) ?? 0;
    const missions_completed = missionsByUserMap.get(profile.id) ?? 0;
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
      score: profile.ranking_score_updated_at
        ? (profile.ranking_score ?? 0)
        : computeRankingScore({
            filled_slots,
            album_pct,
            packs_opened,
            missions_completed,
            trades_accepted,
          }),
      rank: 0,
    };
  });

  const sorted = sortEntries(entries);
  const current_user_entry = await buildCurrentUserRankingEntry(
    admin,
    currentUserId,
    sorted,
    totalSlots,
  );

  if (current_user_entry) {
    const listIndex = sorted.findIndex(
      (entry) => entry.user_id === currentUserId,
    );
    if (listIndex >= 0) {
      sorted[listIndex] = {
        ...current_user_entry,
        rank: sorted[listIndex].rank,
      };
    }
  }

  return {
    total_slots: totalSlots,
    current_user_id: currentUserId,
    current_user_entry,
    entries: sorted,
  };
}
