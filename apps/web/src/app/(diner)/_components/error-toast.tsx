"use client";

import { toast } from "sonner";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ApiError } from "@/lib/api";

const FRENCH_BY_CODE: Record<string, string> = {
  unauthenticated: "Session expirée — reconnectez-vous",
  forbidden: "Action non autorisée",
  not_found: "Introuvable",
  validation: "Entrée invalide",
  insufficient_balance: "Solde insuffisant pour cette récompense",
  internal: "Erreur serveur — réessayez",
};

export function surfaceApiError<TFieldValues extends FieldValues = FieldValues>(
  err: unknown,
  form?: UseFormReturn<TFieldValues>,
): void {
  if (!(err instanceof ApiError)) {
    toast.error("Erreur inattendue");
    return;
  }
  if (err.fields && form) {
    for (const [k, v] of Object.entries(err.fields)) {
      form.setError(k as Path<TFieldValues>, { message: v });
    }
    return;
  }
  toast.error(FRENCH_BY_CODE[err.code] ?? err.message ?? "Erreur");
}
