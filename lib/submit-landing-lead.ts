import { REFERRAL_STORAGE_KEY } from "@/lib/referrals";

export interface SubmitLandingLeadInput {
  name: string;
  email: string;
  estado?: string;
  cidade?: string;
  birthDate?: string;
  newsletterOptIn: boolean;
  privacyAccepted: boolean;
}

function readReferralCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const code = localStorage.getItem(REFERRAL_STORAGE_KEY)?.trim();
    return code || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Envia o lead para integração Salesforce (via API interna).
 * Não lança erro — falhas no webhook não devem bloquear o cadastro.
 */
export async function submitLandingLead(
  input: SubmitLandingLeadInput,
): Promise<void> {
  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        referralCode: readReferralCode(),
        source: "album_boticario_landing",
      }),
    });
  } catch {
    /* cadastro segue mesmo se o webhook falhar */
  }
}
