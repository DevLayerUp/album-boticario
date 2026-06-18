import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchProfilePageData } from "@/lib/profile";

const PROFILE_FIELDS = [
  "display_name",
  "bio",
  "show_in_ranking",
  "notify_new_packs",
  "notify_trades",
  "notify_marketing",
  "language",
  "timezone",
] as const;

type ProfileField = (typeof PROFILE_FIELDS)[number];

function pickProfileUpdates(body: Record<string, unknown>) {
  const updates: Partial<Record<ProfileField, string | boolean | null>> = {};

  for (const key of PROFILE_FIELDS) {
    if (!(key in body)) continue;
    const value = body[key];

    if (key === "display_name" || key === "bio" || key === "language" || key === "timezone") {
      if (value !== null && typeof value !== "string") continue;
      updates[key] = key === "bio" ? (value?.trim() || null) : value?.trim() ?? null;
      continue;
    }

    if (typeof value === "boolean") {
      updates[key] = value;
    }
  }

  return updates;
}

/** GET /api/profile — dados do perfil + estatísticas */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const data = await fetchProfilePageData(supabase, user.id, user.email);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao carregar perfil";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** PATCH /api/profile — atualiza campos editáveis do perfil */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const updates = pickProfileUpdates(body);
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }

  if ("display_name" in updates) {
    const name = updates.display_name;
    if (typeof name !== "string" || name.length < 2) {
      return NextResponse.json(
        { error: "Informe um nome completo válido" },
        { status: 400 },
      );
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    const data = await fetchProfilePageData(supabase, user.id, user.email);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao recarregar perfil";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
