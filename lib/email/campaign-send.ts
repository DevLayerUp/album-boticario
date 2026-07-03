import { getResendClient, getFromAddress, isResendConfigured } from "@/lib/email/resend-client";
import { wrapCampaignHtml } from "@/lib/email/campaign-template";

export { isResendConfigured };

export async function sendCampaignEmail(options: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<{ id: string | null }> {
  const resend = getResendClient();
  const html = wrapCampaignHtml(options.htmlBody);

  const { data, error } = await resend.emails.send({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Falha ao enviar e-mail de campanha.");
  }

  return { id: data?.id ?? null };
}

export async function sendCampaignEmailBatch(
  items: { to: string; subject: string; htmlBody: string }[],
): Promise<{ data: { id: string }[] | null; error: string | null }> {
  if (!items.length) return { data: [], error: null };

  const resend = getResendClient();
  const payload = items.map((item) => ({
    from: getFromAddress(),
    to: item.to,
    subject: item.subject,
    html: wrapCampaignHtml(item.htmlBody),
  }));

  const { data, error } = await resend.batch.send(payload);

  if (error) {
    return { data: null, error: error.message || "Falha no envio em lote." };
  }

  return { data: data?.data ?? [], error: null };
}
