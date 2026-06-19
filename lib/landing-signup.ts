export const LANDING_SIGNUP_STORAGE_KEY = "landing_signup_draft";

const DRAFT_TTL_MS = 30 * 60 * 1000;

export interface LandingSignupDraft {
  email: string;
  name: string;
  cidade?: string;
  idade?: string;
  newsletter: boolean;
}

interface StoredDraft extends LandingSignupDraft {
  ts: number;
}

export function saveLandingSignupDraft(draft: LandingSignupDraft): void {
  const payload: StoredDraft = { ...draft, ts: Date.now() };
  sessionStorage.setItem(LANDING_SIGNUP_STORAGE_KEY, JSON.stringify(payload));
}

export function readLandingSignupDraft(): LandingSignupDraft | null {
  try {
    const raw = sessionStorage.getItem(LANDING_SIGNUP_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.newsletter !== "boolean" ||
      typeof parsed.ts !== "number"
    ) {
      return null;
    }

    if (Date.now() - parsed.ts > DRAFT_TTL_MS) {
      sessionStorage.removeItem(LANDING_SIGNUP_STORAGE_KEY);
      return null;
    }

    return {
      email: parsed.email,
      name: parsed.name,
      cidade: typeof parsed.cidade === "string" ? parsed.cidade : undefined,
      idade: typeof parsed.idade === "string" ? parsed.idade : undefined,
      newsletter: parsed.newsletter,
    };
  } catch {
    return null;
  }
}

export function clearLandingSignupDraft(): void {
  try {
    sessionStorage.removeItem(LANDING_SIGNUP_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
