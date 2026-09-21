"use client";

import { useState } from "react";
import { FileText, Trophy } from "lucide-react";
import type { ConcursoPageConfig } from "@/lib/concurso-page";
import { ConcursoAdminClient } from "./concurso-admin-client";
import { ConcursoContentAdminClient } from "./concurso-content-admin-client";

type Tab = "entries" | "content";

export function ConcursoAdminShell({
  initialContent,
}: {
  initialContent: ConcursoPageConfig;
}) {
  const [tab, setTab] = useState<Tab>("entries");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Concurso Cultural</h1>
        <p className="text-sm text-gray-500">
          Inscrições recebidas e textos da página pública.
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <TabButton
          active={tab === "entries"}
          onClick={() => setTab("entries")}
          icon={<Trophy size={14} />}
          label="Inscrições"
        />
        <TabButton
          active={tab === "content"}
          onClick={() => setTab("content")}
          icon={<FileText size={14} />}
          label="Conteúdo da página"
        />
      </div>

      <div className={tab === "entries" ? "block" : "hidden"}>
        <ConcursoAdminClient embedded />
      </div>
      <div className={tab === "content" ? "block" : "hidden"}>
        <ConcursoContentAdminClient initial={initialContent} />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-gb-green text-gb-green-dark"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
