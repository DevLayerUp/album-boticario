/** Payload enviado ao webhook / integração Salesforce. */
export interface SalesforceLeadPayload {
  name: string;
  email: string;
  estado?: string;
  cidade?: string;
  birthDate?: string;
  newsletterOptIn: boolean;
  privacyAccepted: boolean;
  referralCode?: string;
  source?: string;
}

export interface SalesforceLeadWebhookBody {
  source: string;
  submittedAt: string;
  lead: {
    name: string;
    email: string;
    state?: string;
    city?: string;
    birthDate?: string;
    newsletterOptIn: boolean;
    privacyAccepted: boolean;
    referralCode?: string;
  };
}

const TEST_WEBHOOK_URL =
  "https://webhook.site/c5fbca02-57f1-4a93-a598-f45f960163ee";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getSalesforceLeadWebhookUrl(): string {
  return process.env.SALESFORCE_LEAD_WEBHOOK_URL?.trim() || TEST_WEBHOOK_URL;
}

export function validateSalesforceLeadPayload(
  body: unknown,
): { ok: true; data: SalesforceLeadPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Corpo da requisição inválido." };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";

  if (!name) return { ok: false, error: "Nome é obrigatório." };
  if (!email) return { ok: false, error: "E-mail é obrigatório." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "E-mail inválido." };
  if (raw.privacyAccepted !== true) {
    return { ok: false, error: "Aceite da política de privacidade é obrigatório." };
  }

  const estado =
    typeof raw.estado === "string" && raw.estado.trim()
      ? raw.estado.trim()
      : undefined;
  const cidade =
    typeof raw.cidade === "string" && raw.cidade.trim()
      ? raw.cidade.trim()
      : undefined;
  const birthDate =
    typeof raw.birthDate === "string" && raw.birthDate.trim()
      ? raw.birthDate.trim()
      : undefined;
  const referralCode =
    typeof raw.referralCode === "string" && raw.referralCode.trim()
      ? raw.referralCode.trim().toUpperCase()
      : undefined;
  const source =
    typeof raw.source === "string" && raw.source.trim()
      ? raw.source.trim()
      : "album_boticario_landing";

  return {
    ok: true,
    data: {
      name,
      email,
      estado,
      cidade,
      birthDate,
      newsletterOptIn: raw.newsletterOptIn === true,
      privacyAccepted: true,
      referralCode,
      source,
    },
  };
}

export function buildSalesforceLeadWebhookBody(
  payload: SalesforceLeadPayload,
): SalesforceLeadWebhookBody {
  return {
    source: payload.source ?? "album_boticario_landing",
    submittedAt: new Date().toISOString(),
    lead: {
      name: payload.name,
      email: payload.email,
      state: payload.estado,
      city: payload.cidade,
      birthDate: payload.birthDate,
      newsletterOptIn: payload.newsletterOptIn,
      privacyAccepted: payload.privacyAccepted,
      referralCode: payload.referralCode,
    },
  };
}

export async function forwardLeadToSalesforceWebhook(
  payload: SalesforceLeadPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = getSalesforceLeadWebhookUrl();
  const body = buildSalesforceLeadWebhookBody(payload);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: text || `Webhook respondeu com status ${res.status}.`,
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Falha ao contatar o webhook de leads." };
  }
}
