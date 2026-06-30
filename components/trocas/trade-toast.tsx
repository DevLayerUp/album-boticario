"use client";

import {
  FeedbackToastProvider,
  useFeedbackToast,
  parseApiError,
  type FeedbackToastPayload,
  type FeedbackToastVariant,
} from "@/components/ui/feedback-toast";

export function TradeToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackToastProvider regionLabel="Alertas de trocas">
      {children}
    </FeedbackToastProvider>
  );
}

export const useTradeToast = useFeedbackToast;
export const parseTradeApiError = parseApiError;
export type TradeToastPayload = FeedbackToastPayload;
export type TradeToastVariant = FeedbackToastVariant;
