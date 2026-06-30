import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteProps {
  params: Promise<{ userId: string }>;
}

/** Redireciona para a imagem pública da figurinha (OG / preview em redes sociais). */
export async function GET(_request: Request, { params }: RouteProps) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("sticker_url")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.sticker_url) {
    return NextResponse.json({ error: "Figurinha não encontrada." }, { status: 404 });
  }

  return NextResponse.redirect(profile.sticker_url, 302);
}
