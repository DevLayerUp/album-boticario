import type { SupabaseClient } from "@supabase/supabase-js";

export interface CampaignUserSearchResult {
  id: string;
  display_name: string | null;
  username: string | null;
  email: string;
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function getEmailsForUserIds(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, string>> {
  const pending = new Set(userIds);
  const map = new Map<string, string>();
  if (!pending.size) return map;

  let page = 1;
  while (pending.size > 0 && page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      if (pending.has(user.id) && user.email) {
        map.set(user.id, user.email);
        pending.delete(user.id);
      }
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return map;
}

export async function searchCampaignUsers(
  supabase: SupabaseClient,
  query: string,
): Promise<CampaignUserSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const qLower = q.toLowerCase();
  const results: CampaignUserSearchResult[] = [];
  const seen = new Set<string>();

  function pushResult(
    id: string,
    display_name: string | null,
    username: string | null,
    email: string,
  ) {
    if (seen.has(id) || !email) return;
    seen.add(id);
    results.push({ id, display_name, username, email });
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, username")
    .or(
      `display_name.ilike.%${escapeIlike(q)}%,username.ilike.%${escapeIlike(q)}%`,
    )
    .limit(15);

  if (profilesError) throw new Error(profilesError.message);

  const profileRows = profiles ?? [];
  const emailMap = await getEmailsForUserIds(
    supabase,
    profileRows.map((p) => p.id),
  );

  for (const profile of profileRows) {
    const email = emailMap.get(profile.id);
    if (email) {
      pushResult(profile.id, profile.display_name, profile.username, email);
    }
  }

  const profileById = new Map(profileRows.map((p) => [p.id, p]));
  let page = 1;

  while (results.length < 10 && page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw new Error(error.message);

    for (const user of data.users) {
      if (seen.has(user.id) || !user.email) continue;
      const email = user.email;
      if (!email.toLowerCase().includes(qLower)) continue;

      const profile = profileById.get(user.id);
      const displayName =
        profile?.display_name ??
        (user.user_metadata?.display_name as string | undefined) ??
        (user.user_metadata?.full_name as string | undefined) ??
        null;
      const username =
        profile?.username ??
        (user.user_metadata?.username as string | undefined) ??
        null;

      pushResult(user.id, displayName, username, email);
      if (results.length >= 10) break;
    }

    if (data.users.length < 1000) break;
    page += 1;
  }

  return results.slice(0, 10);
}

export async function getCampaignUserById(
  supabase: SupabaseClient,
  userId: string,
): Promise<CampaignUserSearchResult | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, username")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const emailMap = await getEmailsForUserIds(supabase, [userId]);
  const email = emailMap.get(userId);
  if (!email) return null;

  return {
    id: userId,
    display_name: profile?.display_name ?? null,
    username: profile?.username ?? null,
    email,
  };
}
