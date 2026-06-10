import { dashboardAssets } from "@/lib/dashboard-assets";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-bottom bg-no-repeat bg-surface"
      style={{
        backgroundImage: `url(${dashboardAssets.album.page})`,
        backgroundSize: "auto",
      }}
    >
      {children}
    </div>
  );
}
