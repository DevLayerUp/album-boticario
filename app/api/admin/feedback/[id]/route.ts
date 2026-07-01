import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { isUserFeedbackStatus } from "@/lib/user-feedback";
import { sanitizeId } from "@/lib/sanitize";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  if (!body.status || !isUserFeedbackStatus(String(body.status))) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_feedback")
    .update({ status: body.status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    console.error("[admin/feedback] patch:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (guard) return guard;

  const id = sanitizeId((await params).id);
  if (!id) return NextResponse.json({ error: "ID inválido." }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("user_feedback").delete().eq("id", id);

  if (error) {
    console.error("[admin/feedback] delete:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
