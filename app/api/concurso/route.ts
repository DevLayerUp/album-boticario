import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";
import { formatPhoneBR, isValidPhoneBR } from "@/lib/phone";
import {
  CONCURSO_ANSWER_MAX,
  CONCURSO_ANSWER_MIN,
  getCpfDigits,
  isValidCpf,
  type ContestEntry,
} from "@/lib/concurso";
import { isConcursoWindowOpen, loadConcursoPageConfig, canViewConcurso } from "@/lib/concurso-page";
import { isAdminRole } from "@/lib/admin-users";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function mapEntry(row: {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  answer: string;
  created_at: string;
}): ContestEntry {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    answer: row.answer,
    created_at: row.created_at,
  };
}

const CPF_TAKEN_MESSAGE =
  "Este CPF já possui uma inscrição. Só é permitida uma resposta por CPF.";
const USER_TAKEN_MESSAGE = "Você já enviou uma resposta neste concurso.";

async function findEntryByCpf(cpfDigits: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contest_entries")
    .select("id, user_id")
    .eq("cpf_digits", cpfDigits)
    .maybeSingle();

  if (error) {
    console.error("[concurso] cpf lookup:", error.message, error.code);
    return { error: true as const, row: null };
  }

  return { error: false as const, row: data };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const config = await loadConcursoPageConfig(supabase);
  const isAdmin = isAdminRole(user.app_metadata, user.user_metadata);
  if (!canViewConcurso(config, isAdmin)) {
    return NextResponse.json({ error: "Página indisponível." }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("contest_entries")
    .select("id, full_name, email, phone, answer, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[concurso] select:", error.message, error.code);
    return NextResponse.json({ error: "Não foi possível carregar a inscrição." }, { status: 500 });
  }

  const cpfParam = request.nextUrl.searchParams.get("cpf");
  let cpfTaken = false;
  if (cpfParam) {
    const digits = getCpfDigits(cpfParam);
    if (isValidCpf(digits)) {
      const lookup = await findEntryByCpf(digits);
      if (lookup.error) {
        return NextResponse.json({ error: "Não foi possível validar o CPF." }, { status: 500 });
      }
      cpfTaken = Boolean(lookup.row) && lookup.row?.user_id !== user.id;
    }
  }

  return NextResponse.json({
    open: isConcursoWindowOpen(config),
    entry: data ? mapEntry(data) : null,
    cpfTaken,
  });
}

interface ContestBody {
  full_name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  answer?: string;
  accepted_rules?: boolean;
  accepted_data?: boolean;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const config = await loadConcursoPageConfig(supabase);
  const isAdmin = isAdminRole(user.app_metadata, user.user_metadata);
  if (!canViewConcurso(config, isAdmin)) {
    return NextResponse.json({ error: "Página indisponível." }, { status: 404 });
  }

  if (!isConcursoWindowOpen(config)) {
    return NextResponse.json(
      { error: "O concurso não está aberto para envio neste momento." },
      { status: 403 },
    );
  }

  let body: ContestBody;
  try {
    body = (await request.json()) as ContestBody;
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const fullName = sanitizeText(body.full_name, 120);
  const email = sanitizeText(body.email, 160).toLowerCase();
  const phone = formatPhoneBR(typeof body.phone === "string" ? body.phone : "");
  const cpfDigits = getCpfDigits(typeof body.cpf === "string" ? body.cpf : "");
  const answer = sanitizeText(body.answer, CONCURSO_ANSWER_MAX);

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Informe o nome completo." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  }
  if (!isValidPhoneBR(phone)) {
    return NextResponse.json({ error: "Informe um celular válido." }, { status: 400 });
  }
  if (!isValidCpf(cpfDigits)) {
    return NextResponse.json({ error: "Informe um CPF válido." }, { status: 400 });
  }
  if (answer.length < CONCURSO_ANSWER_MIN) {
    return NextResponse.json(
      { error: `A resposta precisa ter pelo menos ${CONCURSO_ANSWER_MIN} caracteres.` },
      { status: 400 },
    );
  }
  if (body.accepted_rules !== true) {
    return NextResponse.json({ error: "É preciso aceitar o regulamento." }, { status: 400 });
  }
  if (body.accepted_data !== true) {
    return NextResponse.json({ error: "É preciso autorizar o uso dos dados." }, { status: 400 });
  }

  const rl = checkRateLimit(`concurso:${user.id}`, 5, 15 * 60 * 1_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Muitos envios em pouco tempo. Aguarde alguns minutos." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1_000)) },
      },
    );
  }

  const admin = createAdminClient();
  const { data: ownEntry, error: ownError } = await admin
    .from("contest_entries")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (ownError) {
    console.error("[concurso] user lookup:", ownError.message, ownError.code);
    return NextResponse.json({ error: "Não foi possível validar a inscrição." }, { status: 500 });
  }
  if (ownEntry) {
    return NextResponse.json({ error: USER_TAKEN_MESSAGE }, { status: 409 });
  }

  const cpfLookup = await findEntryByCpf(cpfDigits);
  if (cpfLookup.error) {
    return NextResponse.json({ error: "Não foi possível validar o CPF." }, { status: 500 });
  }
  if (cpfLookup.row) {
    return NextResponse.json({ error: CPF_TAKEN_MESSAGE }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("contest_entries")
    .insert({
      user_id: user.id,
      full_name: fullName,
      email,
      phone,
      cpf_digits: cpfDigits,
      answer,
      accepted_rules: true,
      accepted_data: true,
    })
    .select("id, full_name, email, phone, answer, created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      const duplicateCpf = /cpf/i.test(`${error.message} ${error.details ?? ""}`);
      return NextResponse.json(
        { error: duplicateCpf ? CPF_TAKEN_MESSAGE : USER_TAKEN_MESSAGE },
        { status: 409 },
      );
    }
    console.error("[concurso] insert:", error.message, error.code);
    return NextResponse.json({ error: "Não foi possível enviar a resposta." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, entry: mapEntry(data) });
}
