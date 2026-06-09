import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rarities")
    .select("*")
    .order("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await request.json();
  // body = array of { id, drop_percentage, color_hex, animation_type }
  const rarities: Array<{
    id: number;
    drop_percentage: number;
    color_hex?: string;
    animation_type?: string;
  }> = body;

  const total = rarities.reduce((sum, r) => sum + Number(r.drop_percentage), 0);
  if (Math.abs(total - 100) > 0.01) {
    return NextResponse.json(
      { error: `A soma dos percentuais deve ser 100%. Atual: ${total.toFixed(2)}%` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const updates = await Promise.all(
    rarities.map((r) =>
      supabase
        .from("rarities")
        .update({
          drop_percentage: r.drop_percentage,
          color_hex: r.color_hex,
          animation_type: r.animation_type,
        })
        .eq("id", r.id)
        .select()
        .single(),
    ),
  );

  const errors = updates.filter((u) => u.error).map((u) => u.error!.message);
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 500 });
  }

  return NextResponse.json(updates.map((u) => u.data));
}
