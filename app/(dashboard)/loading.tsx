export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando"
      className="flex min-h-[60dvh] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-gb-green"
          role="status"
        />
        <p className="text-sm text-gb-slate">Carregando…</p>
      </div>
    </div>
  );
}
