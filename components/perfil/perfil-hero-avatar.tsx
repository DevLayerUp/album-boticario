"use client";

import { Camera } from "lucide-react";
import Link from "next/link";
import {
  ProfileAvatarImage,
} from "@/components/profile/profile-avatar-image";
import { StickerSharePanel } from "@/components/sticker/sticker-share-panel";
import type { ProfileAvatarVariant } from "@/lib/profile";
import { cn } from "@/lib/utils";

interface PerfilHeroAvatarProps {
  userId: string;
  avatarSrc: string | null;
  avatarVariant: ProfileAvatarVariant | null;
  stickerUrl: string | null;
  displayName: string;
  fallbackInitial: string;
}

export function PerfilHeroAvatar({
  userId,
  avatarSrc,
  avatarVariant,
  stickerUrl,
  displayName,
  fallbackInitial,
}: PerfilHeroAvatarProps) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-4 sm:items-start">
      <div className="relative">
        <div
          className={cn(
            "relative overflow-hidden rounded-full border-[3px] border-white sm:border-4 2xl:border-[5px]",
            "size-24 xs:size-28 sm:size-32 md:size-36 lg:size-40 xl:size-44 2xl:size-[275px]",
          )}
        >
          {avatarSrc && avatarVariant ? (
            <ProfileAvatarImage
              src={avatarSrc}
              variant={avatarVariant}
              sizes="(max-width: 1536px) 176px, 275px"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-verde-escuro-500 text-3xl font-bold text-white sm:text-4xl 2xl:text-5xl">
              {fallbackInitial}
            </div>
          )}
        </div>
        <Link
          href="/figurinha"
          aria-label="Atualizar figurinha do perfil"
          className="absolute -bottom-0.5 -right-0.5 flex size-9 items-center justify-center rounded-full border border-[#c9c9c9] bg-white shadow-sm transition-transform hover:scale-105 sm:size-10 md:size-11 2xl:bottom-1 2xl:right-0 2xl:size-[61px]"
        >
          <Camera
            className="size-4 text-verde-escuro-500 sm:size-5 2xl:size-8"
            aria-hidden
          />
        </Link>
      </div>

      {stickerUrl ? (
        <StickerSharePanel
          userId={userId}
          variant="profile"
          stickerUrl={stickerUrl}
          displayName={displayName}
        />
      ) : null}
    </div>
  );
}
