import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function mapPasswordError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("same") || lower.includes("different")) {
    return "A nova senha deve ser diferente da atual.";
  }
  if (lower.includes("weak") || lower.includes("at least")) {
    return "A nova senha não atende aos requisitos mínimos de segurança.";
  }
  return "Não foi possível atualizar a senha.";
}

/** POST /api/profile/password — valida senha atual e define nova senha */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  const { currentPassword, newPassword, confirmPassword } = body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "Preencha todos os campos de senha." },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "A nova senha deve ter pelo menos 8 caracteres." },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "A confirmação não coincide com a nova senha." },
      { status: 400 },
    );
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json(
      { error: mapPasswordError(updateError.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
