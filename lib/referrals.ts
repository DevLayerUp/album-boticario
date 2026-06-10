/** Chave no localStorage para persistir código de convite até o cadastro. */
export const REFERRAL_STORAGE_KEY = "album_ref_code";

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9]{6,12}$/.test(code) ? code : null;
}

export function buildInviteUrl(code: string, origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/register?ref=${encodeURIComponent(code)}`;
}

export function buildShareText(inviteUrl: string, inviterName?: string | null): string {
  const who = inviterName?.trim() ? `${inviterName.trim()} te convidou` : "Te convido";
  return `${who} para colecionar figurinhas no álbum Fãs da Natureza! Crie sua conta: ${inviteUrl}`;
}

export interface ReferralSummary {
  referral_code: string;
  invite_url: string;
  signup_count: number;
  recent_signups: Array<{
    id: string;
    display_name: string | null;
    created_at: string;
  }>;
}
