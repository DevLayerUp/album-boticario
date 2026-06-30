import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchOpenedPackHistory,
  OPENED_HISTORY_PAGE_SIZE,
} from "@/lib/pack-opened-history";

/** GET /api/pack/opened?offset=0&limit=10 — paginated opened pack history. */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit") ?? OPENED_HISTORY_PAGE_SIZE) || OPENED_HISTORY_PAGE_SIZE),
    OPENED_HISTORY_PAGE_SIZE,
  );

  const admin = createAdminClient();
  const history = await fetchOpenedPackHistory(admin, user.id, offset, limit);

  return NextResponse.json(history);
}
