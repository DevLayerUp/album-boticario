import { formatCpf } from "@/lib/concurso";
import { formatPhoneBR } from "@/lib/phone";
import type { AdminContestEntry } from "@/lib/admin-concurso-list";

/**
 * CSV com separador ";" e BOM UTF-8 para o Excel em português abrir as colunas direto.
 */
const COLUMNS: { header: string; value: (entry: AdminContestEntry) => string }[] = [
  { header: "Inscrição", value: (entry) => String(entry.id) },
  { header: "Enviado em", value: (entry) => formatExportDate(entry.created_at) },
  { header: "Nome", value: (entry) => plainText(entry.full_name) },
  { header: "E-mail", value: (entry) => plainText(entry.email) },
  { header: "Celular", value: (entry) => asText(formatPhoneBR(entry.phone)) },
  { header: "CPF", value: (entry) => asText(formatCpf(entry.cpf_digits)) },
  { header: "Resposta", value: (entry) => plainText(entry.answer) },
  {
    header: "Regulamento aceito",
    value: (entry) => (entry.accepted_rules ? "Sim" : "Não"),
  },
  {
    header: "Uso de dados autorizado",
    value: (entry) => (entry.accepted_data ? "Sim" : "Não"),
  },
];

function formatExportDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  })
    .format(date)
    .replace(",", "");
}

/** Evita que o Excel interprete texto do participante como fórmula. */
function plainText(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/^[=+\-@]/.test(normalized)) return `'${normalized}`;
  return normalized;
}

/** Mantém CPF e celular como texto, sem perder zeros à esquerda. */
function asText(value: string): string {
  return value ? `\t${value}` : "";
}

function csvCell(value: string): string {
  if (/[";\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function contestEntriesToCsv(entries: AdminContestEntry[]): string {
  const headerLine = COLUMNS.map((column) => csvCell(column.header)).join(";");
  const dataLines = entries.map((entry) =>
    COLUMNS.map((column) => csvCell(column.value(entry))).join(";"),
  );
  return `\uFEFF${[headerLine, ...dataLines].join("\r\n")}`;
}

export function contestExportFilename(now = new Date()): string {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return `respostas-concurso-${date}.csv`;
}
