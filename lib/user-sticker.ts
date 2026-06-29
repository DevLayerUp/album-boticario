/** Figurinha de slot do usuário — imagem vem do perfil, não do cadastro admin. */
export function resolveUserStickerImageUrl(
  sticker: { is_user_type: boolean; image_url: string } | null | undefined,
  userStickerUrl: string | null | undefined,
): string | null {
  if (!sticker) return null;
  if (sticker.is_user_type && userStickerUrl) return userStickerUrl;
  return sticker.image_url;
}

export function patchAlbumPagesWithUserSticker<T extends {
  album_slots?: Array<{
    stickers: { is_user_type: boolean; image_url: string } | null | unknown;
  }>;
}>(pages: T[] | null | undefined, userStickerUrl: string | null | undefined): T[] {
  if (!pages?.length || !userStickerUrl) return pages ?? [];

  return pages.map((page) => ({
    ...page,
    album_slots: (page.album_slots ?? []).map((slot) => {
      const sticker = slot.stickers as { is_user_type: boolean; image_url: string } | null;
      if (!sticker?.is_user_type) return slot;
      return {
        ...slot,
        stickers: { ...sticker, image_url: userStickerUrl },
      };
    }),
  }));
}
