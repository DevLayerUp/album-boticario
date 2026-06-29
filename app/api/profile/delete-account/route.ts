import { NextResponse } from "next/server";
import { deleteUserAccount } from "@/lib/delete-user-account";
import { createClient } from "@/lib/supabase/server";

const CONFIRM_PHRASE = "EXCLUIR";

/** POST /api/profile/delete-account — exclui conta e todos os dados do usuário */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { password?: string; confirmPhrase?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const { password, confirmPhrase } = body;

  if (!password) {
    return NextResponse.json(
      { error: "Informe sua senha para confirmar a exclusão." },
      { status: 400 },
    );
  }

  if (confirmPhrase?.trim().toUpperCase() !== CONFIRM_PHRASE) {
    return NextResponse.json(
      { error: `Digite ${CONFIRM_PHRASE} para confirmar a exclusão da conta.` },
      { status: 400 },
    );
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 400 });
  }

  try {
    await deleteUserAccount(user.id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível excluir a conta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
