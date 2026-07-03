import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRole } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

/** POST /api/admin/usuarios/role — promove/rebaixa um usuário a admin. */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard) return guard;

  let body: { user_id?: unknown; is_admin?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const userId = typeof body.user_id === "string" ? body.user_id : "";
  const makeAdmin = body.is_admin === true;

  if (!userId) {
    return NextResponse.json({ error: "user_id é obrigatório" }, { status: 400 });
  }

  // Impede que o admin logado remova o próprio acesso (evita lockout).
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (currentUser?.id === userId && !makeAdmin) {
    return NextResponse.json(
      { error: "Você não pode remover o seu próprio acesso de admin." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: target, error: getErr } = await admin.auth.admin.getUserById(userId);
  if (getErr || !target?.user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Preserva o app_metadata existente, apenas ajustando a role.
  const currentMeta = target.user.app_metadata ?? {};
  const nextMeta: Record<string, unknown> = { ...currentMeta };
  if (makeAdmin) {
    nextMeta.role = "admin";
  } else {
    delete nextMeta.role;
  }

  const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: nextMeta,
  });
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Admins não aparecem no ranking público; ao rebaixar, volta a aparecer.
  await admin
    .from("profiles")
    .update({ show_in_ranking: !makeAdmin })
    .eq("id", userId);

  return NextResponse.json({
    ok: true,
    user_id: userId,
    is_admin: isAdminRole(nextMeta, target.user.user_metadata),
  });
}
