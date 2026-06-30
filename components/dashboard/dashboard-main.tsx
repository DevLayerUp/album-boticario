"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DashboardMainProps {
  children: React.ReactNode;
}

export function DashboardMain({ children }: DashboardMainProps) {
  const pathname = usePathname();
  const isFullBleed = pathname === "/perfil" || pathname === "/figurinha";
  const isAlbum = pathname === "/album" || pathname.startsWith("/album/");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn(
        "mx-auto flex w-full flex-1 flex-col min-h-0",
        isFullBleed
          ? "max-w-none px-0 pt-0 pb-24 md:pb-8"
          : isAlbum
            ? "max-w-[1680px] px-3 pt-2 pb-20 md:px-12 md:pb-8 md:pt-8 2xl:px-[120px]"
            : "max-w-[1680px] px-6 pt-8 pb-24 md:px-12 md:pb-8 2xl:px-[120px]",
      )}
    >
      {children}
    </main>
  );
}
