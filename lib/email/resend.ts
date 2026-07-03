import {
  renderAuthEmailTemplate,
  renderFeedbackReplyEmail,
  type AuthEmailTemplateId,
  type AuthEmailTemplateVariables,
  type FeedbackReplyEmailVariables,
} from "@/lib/email/templates";
import { getResendClient, getFromAddress } from "@/lib/email/resend-client";

export async function sendAuthEmail(options: {
  to: string;
  templateId: AuthEmailTemplateId;
  variables?: AuthEmailTemplateVariables;
  /** @deprecated use variables.confirmationUrl */
  confirmationUrl?: string;
  /** @deprecated use variables.siteUrl */
  siteUrl?: string;
}): Promise<void> {
  const variables: AuthEmailTemplateVariables = {
    ...options.variables,
    confirmationUrl:
      options.variables?.confirmationUrl ?? options.confirmationUrl,
    siteUrl: options.variables?.siteUrl ?? options.siteUrl,
  };

  const { subject, html } = renderAuthEmailTemplate(options.templateId, variables);

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: options.to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Falha ao enviar e-mail transacional.");
  }
}

<<<<<<< Updated upstream
export async function sendFeedbackReplyEmail(options: {
  to: string;
  variables: FeedbackReplyEmailVariables;
}): Promise<void> {
  const { subject, html } = renderFeedbackReplyEmail(options.variables);

  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: options.to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Falha ao enviar resposta por e-mail.");
  }
}

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}
=======
export { isResendConfigured } from "@/lib/email/resend-client";
>>>>>>> Stashed changes
