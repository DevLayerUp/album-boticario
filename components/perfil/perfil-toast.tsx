"use client";

import {
  FeedbackToastProvider,
  useFeedbackToast,
  parseApiError,
} from "@/components/ui/feedback-toast";

export function PerfilToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackToastProvider regionLabel="Alertas do perfil">
      {children}
    </FeedbackToastProvider>
  );
}

export const usePerfilToast = useFeedbackToast;
export const parsePerfilApiError = parseApiError;
