export const COOKIE_CONSENT_KEY = "fgb_cookie_consent";
export const COOKIE_CONSENT_VERSION = 1;
export const OPEN_COOKIE_PREFERENCES_EVENT = "fgb:open-cookie-preferences";

export interface CookieConsentPreferences {
  version: typeof COOKIE_CONSENT_VERSION;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export function defaultPreferences(
  overrides?: Partial<Pick<CookieConsentPreferences, "analytics" | "marketing">>,
): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    analytics: overrides?.analytics ?? false,
    marketing: overrides?.marketing ?? false,
    updatedAt: new Date().toISOString(),
  };
}

export function readCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null;
    return defaultPreferences({
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    });
  } catch {
    return null;
  }
}

export function saveCookieConsent(prefs: CookieConsentPreferences): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
  window.dispatchEvent(
    new CustomEvent("cookie-consent-updated", { detail: prefs }),
  );
}

export function openCookiePreferences(): void {
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
}
