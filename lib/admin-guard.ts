import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifica se o usuário autenticado tem role === "admin".
 * Retorna NextResponse 403 se não for admin, ou null se ok.
 * Uso: const guard = await adminGuard(); if (guard) return guard;
 */
export async function adminGuard(): Promise<NextResponse | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role =
    (user?.app_metadata?.role ?? user?.user_metadata?.role) as
      | string
      | undefined;

  if (!user || role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
