import { createAdminClient } from "@/lib/supabase/admin";
import { AutomacoesEmailClient } from "./automacoes-email-client";
import { isResendConfigured } from "@/lib/email/campaign-send";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Automações de E-mail — Admin",
};

export default async function AdminAutomacoesEmailPage() {
  const supabase = createAdminClient();
  const [{ data: campaigns }, { data: missions }] = await Promise.all([
    supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("missions")
      .select("id, title, is_active")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Automações de E-mail</h1>
        <p className="mt-1 text-sm text-gray-500">
          Programe envios de avisos, notificações e novidades via Resend.
        </p>
        {!isResendConfigured() && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Resend não configurado. Defina RESEND_API_KEY e RESEND_FROM_EMAIL para agendar envios.
          </p>
        )}
      </div>
      <AutomacoesEmailClient
        initialData={campaigns ?? []}
        missions={missions ?? []}
      />
    </div>
  );
}
