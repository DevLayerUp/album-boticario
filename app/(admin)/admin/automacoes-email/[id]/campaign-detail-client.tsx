"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  LOG_STATUS_LABELS,
  STATUS_LABELS,
  resolveAudienceLabel,
  type CampaignLogsResponse,
  type CampaignLogsSummary,
  type CampaignMissionOption,
  type CampaignTimelineBucket,
  type EmailCampaign,
  type EmailCampaignLog,
  type EmailCampaignLogStatus,
} from "@/lib/email/campaign-types";

const STATUS_COLORS: Record<EmailCampaign["status"], string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const LOG_STATUS_COLORS: Record<EmailCampaignLogStatus, string> = {
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-600",
};

function DonutChart({
  sent,
  failed,
  pending,
}: {
  sent: number;
  failed: number;
  pending: number;
}) {
  const total = sent + failed + pending || 1;
  const sentPct = (sent / total) * 100;
  const failedPct = (failed / total) * 100;
  const successRate = Math.round((sent / (sent + failed || 1)) * 100);

  const gradient = `conic-gradient(
    #22c55e 0 ${sentPct}%,
    #ef4444 ${sentPct}% ${sentPct + failedPct}%,
    #e5e7eb ${sentPct + failedPct}% 100%
  )`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative size-36 rounded-full"
        style={{ background: gradient }}
        role="img"
        aria-label={`${successRate}% de sucesso nos envios processados`}
      >
        <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-bold text-gray-900">{successRate}%</span>
          <span className="text-xs text-gray-500">sucesso</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-green-500" />
          Enviados ({sent})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500" />
          Falhas ({failed})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-gray-300" />
          Pendentes ({pending})
        </span>
      </div>
    </div>
  );
}

function TimelineChart({ timeline }: { timeline: CampaignTimelineBucket[] }) {
  if (!timeline.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Nenhum envio registrado ainda.
      </p>
    );
  }

  const max = Math.max(...timeline.map((b) => b.sent + b.failed), 1);

  return (
    <div className="flex h-44 items-end gap-2 overflow-x-auto pb-2">
      {timeline.map((bucket) => {
        const sentH = (bucket.sent / max) * 100;
        const failedH = (bucket.failed / max) * 100;
        return (
          <div
            key={bucket.key}
            className="flex min-w-[48px] flex-1 flex-col items-center gap-1"
            title={`${bucket.label}: ${bucket.sent} enviados, ${bucket.failed} falhas`}
          >
            <div className="flex h-28 w-full items-end justify-center gap-0.5">
              <div
                className="w-3 rounded-t bg-green-500 transition-all"
                style={{ height: `${sentH}%`, minHeight: bucket.sent ? 4 : 0 }}
              />
              <div
                className="w-3 rounded-t bg-red-500 transition-all"
                style={{ height: `${failedH}%`, minHeight: bucket.failed ? 4 : 0 }}
              />
            </div>
            <span className="max-w-[56px] truncate text-center text-[10px] text-gray-400">
              {bucket.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function CampaignDetailClient({
  campaign,
  missions,
  initialSummary,
  initialTimeline,
  initialLogs,
  initialPagination,
}: {
  campaign: EmailCampaign;
  missions: CampaignMissionOption[];
  initialSummary: CampaignLogsSummary;
  initialTimeline: CampaignTimelineBucket[];
  initialLogs: EmailCampaignLog[];
  initialPagination: CampaignLogsResponse["pagination"];
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [logs, setLogs] = useState(initialLogs);
  const [pagination, setPagination] = useState(initialPagination);
  const [statusFilter, setStatusFilter] = useState<EmailCampaignLogStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState(campaign.status);

  const fetchLogs = useCallback(async (opts?: { page?: number; status?: EmailCampaignLogStatus | "all" }) => {
    const nextPage = opts?.page ?? page;
    const nextStatus = opts?.status ?? statusFilter;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: "25",
      });
      if (nextStatus !== "all") params.set("status", nextStatus);

      const res = await fetch(`/api/admin/email-campaigns/${campaign.id}/logs?${params}`);
      const data = await res.json();
      if (!res.ok) return;

      setSummary(data.summary);
      setTimeline(data.timeline);
      setLogs(data.logs);
      setPagination(data.pagination);
      setCampaignStatus(data.campaign.status);
    } finally {
      setLoading(false);
    }
  }, [campaign.id, page, statusFilter]);

  useEffect(() => {
    if (campaignStatus !== "sending") return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 15000);
    return () => clearInterval(interval);
  }, [campaignStatus, fetchLogs]);

  function handleFilterChange(status: EmailCampaignLogStatus | "all") {
    setStatusFilter(status);
    setPage(1);
    fetchLogs({ page: 1, status });
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    fetchLogs({ page: nextPage });
  }

  const filters: { key: EmailCampaignLogStatus | "all"; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "sent", label: "Enviados" },
    { key: "failed", label: "Falhas" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[campaignStatus]}`}
        >
          {STATUS_LABELS[campaignStatus]}
        </span>
        <span>{CATEGORY_LABELS[campaign.category]}</span>
        <span>·</span>
        <span>
          {resolveAudienceLabel(campaign.audience, campaign.audience_filter ?? {}, missions)}
        </span>
        <span>·</span>
        <span>Agendado: {new Date(campaign.scheduled_at).toLocaleString("pt-BR")}</span>
        {campaign.sent_at && (
          <>
            <span>·</span>
            <span>Concluído: {new Date(campaign.sent_at).toLocaleString("pt-BR")}</span>
          </>
        )}
        <button
          type="button"
          onClick={() => fetchLogs()}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de destinatários"
          value={summary.total}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Enviados"
          value={summary.sent}
          icon={CheckCircle2}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Falhas"
          value={summary.failed}
          icon={XCircle}
          color="bg-red-50 text-red-600"
        />
        <StatCard
          label="Pendentes"
          value={summary.pending}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Distribuição de envios</h2>
          <DonutChart
            sent={summary.sent}
            failed={summary.failed}
            pending={summary.pending}
          />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Envios por hora</h2>
          <TimelineChart timeline={timeline} />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-900">Registro de envios</h2>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => handleFilterChange(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f.key
                    ? "bg-gb-green text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {logs.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-gray-400">
            {campaignStatus === "draft" || campaignStatus === "scheduled"
              ? "Os envios aparecerão aqui quando a campanha for disparada."
              : "Nenhum registro para o filtro selecionado."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Destinatário</th>
                  <th className="px-4 py-3 font-medium">E-mail</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Enviado em</th>
                  <th className="px-4 py-3 font-medium">Detalhe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-900">
                      {log.display_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LOG_STATUS_COLORS[log.status]}`}
                      >
                        {LOG_STATUS_LABELS[log.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(log.sent_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-gray-500">
                      {log.status === "failed"
                        ? log.error ?? "Erro desconhecido"
                        : log.resend_id
                          ? `ID: ${log.resend_id}`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              {pagination.total} registro(s) · página {pagination.page} de{" "}
              {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 disabled:opacity-40"
                aria-label="Próxima página"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {campaignStatus === "sending" && (
        <p className="flex items-center gap-2 text-xs text-amber-700">
          <Loader2 size={12} className="animate-spin" />
          Campanha em envio — esta página atualiza automaticamente a cada 15 segundos.
        </p>
      )}
    </div>
  );
}
