import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/app-settings?key=album_cover_url
 * Returns { key, value } for the given key.
 * Public read — no auth required (RLS allows SELECT for everyone).
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Param 'key' required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .eq("key", key)
    .single();

  if (error) {
    return NextResponse.json({ key, value: null });
  }

  return NextResponse.json(data);
}

/**
 * PUT /api/admin/app-settings
 * Body: { key: string; value: string | null }
 * Admin only — writes via service_role to bypass RLS.
 */
export async function PUT(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = (await request.json()) as { key?: string; value?: string | null };
  if (!body.key) {
    return NextResponse.json({ error: "Field 'key' required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("app_settings")
    .upsert(
      { key: body.key, value: body.value ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
