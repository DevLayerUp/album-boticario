import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeRedirectUrl } from "@/lib/sticker-redirect-url";
import { normalizeStickerPromotionInput } from "@/lib/sticker-promotion";
import { isMissingStickerPublicColumn } from "@/lib/sticker-visibility";
import {
  normalizeStickerDescription,
  validateStickerDescription,
  STICKER_DESCRIPTION_MAX_LENGTH,
} from "@/lib/sticker-description";
import {
  normalizeStickerName,
  STICKER_NAME_MAX_LENGTH,
  validateStickerFormattedText,
} from "@/lib/sticker-text-format";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stickers")
    .select(`*, sticker_categories(id, name), rarities(id, name, color_hex)`)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const body = await request.json();
  const {
    name,
    description,
    image_url,
    category_id,
    rarity_id,
    is_user_type,
    is_active,
    redirect_url,
    is_public,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const nameFormatError = validateStickerFormattedText(
    name,
    STICKER_NAME_MAX_LENGTH,
    "O nome",
  );
  if (nameFormatError) {
    return NextResponse.json({ error: nameFormatError }, { status: 400 });
  }

  const descriptionFormatError = validateStickerFormattedText(
    description,
    STICKER_DESCRIPTION_MAX_LENGTH,
    "A descrição",
  );
  if (descriptionFormatError) {
    return NextResponse.json({ error: descriptionFormatError }, { status: 400 });
  }

  if (redirect_url && normalizeRedirectUrl(redirect_url) === null) {
    return NextResponse.json({ error: "Link do material inválido" }, { status: 400 });
  }

  const descriptionError = validateStickerDescription(description);
  if (descriptionError) {
    return NextResponse.json({ error: descriptionError }, { status: 400 });
  }

  const promotion = normalizeStickerPromotionInput(body);
  if ("error" in promotion) {
    return NextResponse.json({ error: promotion.error }, { status: 400 });
  }

  const supabase = createAdminClient();
  const row: Record<string, unknown> = {
    name: normalizeStickerName(name),
    description: normalizeStickerDescription(description),
    image_url,
    redirect_url: normalizeRedirectUrl(redirect_url),
    category_id: category_id || null,
    rarity_id: rarity_id || null,
    is_user_type: !!is_user_type,
    is_active: is_active ?? true,
    ...promotion,
  };
  if (typeof is_public === "boolean") row.is_public = is_public;

  const first = await supabase.from("stickers").update(row).eq("id", id).select().single();
  if (first.error && isMissingStickerPublicColumn(first.error) && "is_public" in row) {
    const { is_public: _ignored, ...without } = row;
    const retry = await supabase.from("stickers").update(without).eq("id", id).select().single();
    if (retry.error) return NextResponse.json({ error: retry.error.message }, { status: 500 });
    return NextResponse.json(retry.data);
  }

  if (first.error) return NextResponse.json({ error: first.error.message }, { status: 500 });
  return NextResponse.json(first.data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("stickers").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
