"use client";

import { usePathname } from "next/navigation";
import { dashboardAssets } from "@/lib/dashboard-assets";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAlbumPage = pathname === "/album";

  return (
    <div
      className="flex min-h-dvh flex-col bg-bottom bg-no-repeat bg-surface"
      style={
        isAlbumPage
          ? {
              backgroundImage: `url(${dashboardAssets.album.page})`,
              backgroundSize: "auto",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
