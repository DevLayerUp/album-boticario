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

/** CloudPage (Code Resource JSON) do Salesforce que dispara o e-mail de boas-vindas. */
const CLOUDPAGE_SIGNUP_URL =
  "https://cloud.contato.fundacaogrupoboticario.org.br/cadastro-album";

export function getCloudPageSignupUrl(): string {
  return process.env.SALESFORCE_CLOUDPAGE_URL?.trim() || CLOUDPAGE_SIGNUP_URL;
}

/**
 * Converte a data do input (YYYY-MM-DD) para DD/MM/YYYY exigido pela CloudPage.
 * Se já vier em outro formato, repassa como texto.
 */
export function formatBirthDateBR(value?: string): string {
  if (!value) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return value.trim();
}

/**
 * Envia o cadastro para a CloudPage do Salesforce (x-www-form-urlencoded),
 * que gera a SubscriberKey, injeta na Data Extension e dispara o e-mail de
 * boas-vindas de forma síncrona. Retorna a mensagem estruturada da resposta.
 */
export async function forwardLeadToCloudPage(
  payload: SalesforceLeadPayload,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const url = getCloudPageSignupUrl();

  const params = new URLSearchParams();
  params.set("Email", payload.email);
  params.set("Name", payload.name);
  params.set("DataNascimento", formatBirthDateBR(payload.birthDate));
  params.set("Estado", payload.estado ?? "");
  params.set("Cidade", payload.cidade ?? "");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
      cache: "no-store",
    });

    const text = await res.text().catch(() => "");
    let json: { status?: string; message?: string } | null = null;
    try {
      json = text ? (JSON.parse(text) as { status?: string; message?: string }) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      return {
        ok: false,
        error: json?.message || `CloudPage respondeu com status ${res.status}.`,
      };
    }

    if (json?.status === "success") {
      return {
        ok: true,
        message: json.message ?? "Cadastro realizado e email disparado com sucesso!",
      };
    }

    return {
      ok: false,
      error: json?.message || "CloudPage retornou um erro não identificado.",
    };
  } catch {
    return { ok: false, error: "Falha ao contatar a CloudPage do Salesforce." };
  }
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
