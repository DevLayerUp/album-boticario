import type { SupabaseClient } from "@supabase/supabase-js";
import { countAssignedAlbumSlots } from "@/lib/album-progress";
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

const LEADERBOARD_TTL_MS = 60_000;
const ADMIN_IDS_TTL_MS = 5 * 60_000;

let adminIdsCache: { ids: Set<string>; expires: number } | null = null;

let leaderboardCoreCache: {
  entries: RankingEntry[];
  total_slots: number;
  expires: number;
} | null = null;

interface LeaderboardStatsRow {
  user_id: string;
  display_name: string | null;
  username: string | null;
  sticker_url: string | null;
  avatar_url: string | null;
  show_in_ranking: boolean | null;
  ranking_score: number;
  ranking_score_updated_at: string | null;
  filled_slots: number;
  packs_opened: number;
  packs_unopened: number;
  missions_completed: number;
  trades_accepted: number;
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

async function getCachedAdminUserIds(
  admin: SupabaseClient,
): Promise<Set<string>> {
  const now = Date.now();
  if (adminIdsCache && adminIdsCache.expires > now) {
    return adminIdsCache.ids;
  }
  const ids = await listAdminUserIds(admin);
  adminIdsCache = { ids, expires: now + ADMIN_IDS_TTL_MS };
  return ids;
}

export function invalidateLeaderboardCache(): void {
  leaderboardCoreCache = null;
}

async function fetchLeaderboardStatsRows(
  admin: SupabaseClient,
): Promise<LeaderboardStatsRow[] | null> {
  const { data, error } = await admin.rpc("get_leaderboard_stats");
  if (error) {
    console.warn("[ranking] get_leaderboard_stats RPC unavailable:", error.message);
    return null;
  }
  return (data ?? []) as LeaderboardStatsRow[];
}

async function buildMissionCountsFromUserMissions(
  admin: SupabaseClient,
): Promise<Map<string, number>> {
  const rows = await fetchAllPages<{ user_id: string }>((from, to) =>
    admin
      .from("user_missions")
      .select("user_id")
      .not("completed_at", "is", null)
      .range(from, to),
  );

  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  return counts;
}

function mapStatsRowToEntry(
  row: LeaderboardStatsRow,
  totalSlots: number,
): Omit<RankingEntry, "rank"> {
  const filled_slots = Number(row.filled_slots) || 0;
  const album_pct = computeAlbumProgressPct(filled_slots, Math.max(totalSlots, 1));
  const packs_opened = Number(row.packs_opened) || 0;
  const packs_unopened = Number(row.packs_unopened) || 0;
  const missions_completed = Number(row.missions_completed) || 0;
  const trades_accepted = Number(row.trades_accepted) || 0;

  return {
    user_id: row.user_id,
    display_name: row.display_name ?? row.username ?? "Colecionador",
    username: row.username,
    sticker_url: row.sticker_url,
    avatar_url: row.avatar_url,
    filled_slots,
    album_pct,
    total_slots: totalSlots,
    packs_opened,
    packs_unopened,
    missions_completed,
    trades_accepted,
    score: row.ranking_score_updated_at
      ? (row.ranking_score ?? 0)
      : computeRankingScore({
          filled_slots,
          album_pct,
          packs_opened,
          missions_completed,
          trades_accepted,
        }),
  };
}

async function buildLeaderboardCoreLegacy(
  admin: SupabaseClient,
  adminUserIds: Set<string>,
): Promise<{ entries: RankingEntry[]; total_slots: number }> {
  const [profiles, totalSlots, albumRows, packRows, missionsByUser, tradeRows] =
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
      countAssignedAlbumSlots(admin),
      fetchAllPages<{ user_id: string }>((from, to) =>
        admin
          .from("user_album")
          .select("user_id, album_slots!inner(sticker_id)")
          .not("album_slots.sticker_id", "is", null)
          .range(from, to),
      ),
      fetchAllPages<{ user_id: string; opened_at: string | null }>((from, to) =>
        admin.from("packs").select("user_id, opened_at").range(from, to),
      ),
      buildMissionCountsFromUserMissions(admin),
      fetchAllPages<{ requester_id: string; receiver_id: string }>((from, to) =>
        admin
          .from("trade_requests")
          .select("requester_id, receiver_id")
          .eq("status", "accepted")
          .range(from, to),
      ),
    ]);

  const totalSlotsNormalized = Math.max(totalSlots, 1);

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
      const album_pct = computeAlbumProgressPct(filled_slots, totalSlotsNormalized);
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

  return {
    entries: sortEntries(entries),
    total_slots: totalSlots,
  };
}

async function buildLeaderboardCore(
  admin: SupabaseClient,
): Promise<{ entries: RankingEntry[]; total_slots: number }> {
  const [statsRows, totalSlots, adminUserIds] = await Promise.all([
    fetchLeaderboardStatsRows(admin),
    countAssignedAlbumSlots(admin),
    getCachedAdminUserIds(admin),
  ]);

  if (statsRows) {
    const entries = sortEntries(
      statsRows
        .filter(
          (row) =>
            row.show_in_ranking !== false && !adminUserIds.has(row.user_id),
        )
        .map((row) => mapStatsRowToEntry(row, totalSlots)),
    );
    return { entries, total_slots: totalSlots };
  }

  return buildLeaderboardCoreLegacy(admin, adminUserIds);
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

/** Posição no ranking só para o usuário logado — sem varrer tabelas inteiras. */
export async function getUserRankPosition(
  admin: SupabaseClient,
  userId: string,
): Promise<number | null> {
  const [{ data: profile }, adminUserIds] = await Promise.all([
    admin
      .from("profiles")
      .select("ranking_score, show_in_ranking, ranking_score_updated_at")
      .eq("id", userId)
      .maybeSingle(),
    getCachedAdminUserIds(admin),
  ]);

  if (!profile || profile.show_in_ranking === false || adminUserIds.has(userId)) {
    return null;
  }

  let score = profile.ranking_score ?? 0;
  if (!profile.ranking_score_updated_at) {
    const input = await loadRankingScoreInput(admin, userId);
    score = computeRankingScore(input);
  }

  const adminIdList = [...adminUserIds];
  let query = admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .or("show_in_ranking.is.null,show_in_ranking.eq.true")
    .gt("ranking_score", score);

  if (adminIdList.length > 0) {
    query = query.not("id", "in", `(${adminIdList.join(",")})`);
  }

  const { count, error } = await query;
  if (error) throw error;

  return (count ?? 0) + 1;
}

export async function buildLeaderboard(
  admin: SupabaseClient,
  currentUserId: string,
): Promise<LeaderboardResponse> {
  const now = Date.now();
  let core = leaderboardCoreCache;

  if (!core || core.expires <= now) {
    const built = await buildLeaderboardCore(admin);
    core = {
      entries: built.entries,
      total_slots: built.total_slots,
      expires: now + LEADERBOARD_TTL_MS,
    };
    leaderboardCoreCache = core;
  }

  const totalSlotsNormalized = Math.max(core.total_slots, 1);
  const current_user_entry = await buildCurrentUserRankingEntry(
    admin,
    currentUserId,
    core.entries,
    totalSlotsNormalized,
  );

  const entries = [...core.entries];
  if (current_user_entry) {
    const listIndex = entries.findIndex(
      (entry) => entry.user_id === currentUserId,
    );
    if (listIndex >= 0) {
      entries[listIndex] = {
        ...current_user_entry,
        rank: entries[listIndex].rank,
      };
    }
  }

  return {
    total_slots: core.total_slots,
    current_user_id: currentUserId,
    current_user_entry,
    entries,
  };
}
