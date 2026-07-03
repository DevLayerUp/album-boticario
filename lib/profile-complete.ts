export interface ProfileCompleteFields {
  display_name: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  avatar_url: string | null;
  sticker_url: string | null;
}

/** Espelha o critério em lib/missions.ts e reconcile_complete_profile.sql */
export function isProfileComplete(profile: ProfileCompleteFields | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.display_name?.trim() &&
      profile.bio?.trim() &&
      profile.phone?.trim() &&
      profile.city?.trim() &&
      profile.state?.trim() &&
      (profile.avatar_url || profile.sticker_url),
  );
}
