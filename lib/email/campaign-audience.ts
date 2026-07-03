import type { SupabaseClient } from "@supabase/supabase-js";
import { listAdminUserIds } from "@/lib/admin-users";
import { isProfileComplete } from "@/lib/profile-complete";
import type {
  CampaignRecipient,
  EmailCampaignAudience,
  EmailCampaignAudienceFilter,
  EmailCampaignCategory,
} from "@/lib/email/campaign-types";

interface ProfileRow {
  id: string;
  display_name: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  sticker_url: string | null;
  first_steps_completed_at: string | null;
  notify_marketing: boolean;
}

async function fetchAllAuthEmails(
  supabase: SupabaseClient,
): Promise<Map<string, { email: string | null; displayName: string | null }>> {
  const map = new Map<string, { email: string | null; displayName: string | null }>();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      const displayName =
        (user.user_metadata?.display_name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        null;
      map.set(user.id, { email: user.email ?? null, displayName });
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return map;
}

async function getMissionCompletedUserIds(
  supabase: SupabaseClient,
  missionId: number,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("user_missions")
    .select("user_id")
    .eq("mission_id", missionId)
    .not("completed_at", "is", null);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.user_id as string));
}

function isValidEmail(email: string | null | undefined): email is string {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function matchesDashboardAudience(
  profile: ProfileRow,
  audience: EmailCampaignAudience,
): boolean {
  switch (audience) {
    case "incomplete_profile":
      return !isProfileComplete(profile);
    case "incomplete_first_steps":
      return !profile.first_steps_completed_at;
    case "no_sticker":
      return !profile.sticker_url;
    default:
      return true;
  }
}

function profilesToRecipients(
  profiles: ProfileRow[],
  authMap: Map<string, { email: string | null; displayName: string | null }>,
): CampaignRecipient[] {
  const recipients: CampaignRecipient[] = [];
  const seenEmails = new Set<string>();

  for (const profile of profiles) {
    const auth = authMap.get(profile.id);
    const email = auth?.email ?? null;
    if (!isValidEmail(email)) continue;

    const normalized = email.toLowerCase();
    if (seenEmails.has(normalized)) continue;
    seenEmails.add(normalized);

    recipients.push({
      userId: profile.id,
      email,
      displayName: profile.display_name ?? auth?.displayName ?? null,
    });
  }

  return recipients;
}

export async function buildCampaignAudience(
  supabase: SupabaseClient,
  options: {
    audience: EmailCampaignAudience;
    category: EmailCampaignCategory;
    audienceFilter?: EmailCampaignAudienceFilter;
  },
): Promise<CampaignRecipient[]> {
  const { audience, category, audienceFilter = {} } = options;

  if (audience === "mission_incomplete" && !audienceFilter.mission_id) {
    throw new Error("Selecione uma missão para este segmento.");
  }

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, bio, phone, city, state, avatar_url, sticker_url, first_steps_completed_at, notify_marketing",
    );

  if (audienceFilter.state?.trim()) {
    query = query.eq("state", audienceFilter.state.trim().toUpperCase());
  }

  if (audience === "marketing_opt_in" || category === "novidade") {
    query = query.eq("notify_marketing", true);
  }

  const { data: profiles, error } = await query.range(0, 99999);
  if (error) throw new Error(error.message);

  let filtered = (profiles ?? []) as ProfileRow[];

  if (audience === "admins_test") {
    const adminIds = await listAdminUserIds(supabase);
    filtered = filtered.filter((p) => adminIds.has(p.id));
  } else {
    const adminIds = await listAdminUserIds(supabase);
    filtered = filtered.filter((p) => !adminIds.has(p.id));
  }

  if (
    audience === "incomplete_profile" ||
    audience === "incomplete_first_steps" ||
    audience === "no_sticker"
  ) {
    filtered = filtered.filter((p) => matchesDashboardAudience(p, audience));
  }

  if (audience === "mission_incomplete" && audienceFilter.mission_id) {
    const completedIds = await getMissionCompletedUserIds(
      supabase,
      audienceFilter.mission_id,
    );
    filtered = filtered.filter((p) => !completedIds.has(p.id));
  }

  const authMap = await fetchAllAuthEmails(supabase);
  return profilesToRecipients(filtered, authMap);
}

export async function countCampaignAudience(
  supabase: SupabaseClient,
  options: Parameters<typeof buildCampaignAudience>[1],
): Promise<number> {
  const recipients = await buildCampaignAudience(supabase, options);
  return recipients.length;
}
