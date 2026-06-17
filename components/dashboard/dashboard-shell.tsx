"use client";

import { usePathname } from "next/navigation";
import { dashboardAssets } from "@/lib/dashboard-assets";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageBackground =
    pathname === "/album"
      ? dashboardAssets.album.page
      : pathname === "/pacotinhos"
        ? dashboardAssets.pacotinhos.page
        : null;

  return (
    <div
      className="flex min-h-dvh flex-col bg-bottom bg-no-repeat bg-surface"
      style={
        pageBackground
          ? {
              backgroundImage: `url(${pageBackground})`,
              backgroundSize: "auto",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
