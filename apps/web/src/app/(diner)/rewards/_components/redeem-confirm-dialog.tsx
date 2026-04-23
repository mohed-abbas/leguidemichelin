"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { surfaceApiError } from "@/app/(diner)/_components/error-toast";
import type { RewardResponseType, RedemptionResponseType } from "@repo/shared-schemas";

interface RedeemConfirmDialogProps {
  reward: RewardResponseType;
  balance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedeemed: (newBalance: number) => void;
}

export function RedeemConfirmDialog({
  reward,
  balance,
  open,
  onOpenChange,
  onRedeemed,
}: RedeemConfirmDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [insufficientMsg, setInsufficientMsg] = useState<string | null>(null);

  async function handleRedeem() {
    setLoading(true);
    setInsufficientMsg(null);
    try {
      const result = await api.post<RedemptionResponseType>("/redeem", { rewardId: reward.id });
      toast.success(`Récompense obtenue — code : ${result.code}`);
      onRedeemed(balance - reward.pointsCost);
      onOpenChange(false);
      router.push("/me/redemptions");
    } catch (err) {
      if (err instanceof ApiError && err.code === "insufficient_balance") {
        setInsufficientMsg(
          `Pas assez de points — solde : ${balance}, requis : ${reward.pointsCost}.`,
        );
      } else {
        surfaceApiError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Utiliser une récompense</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <p style={{ margin: 0 }}>
            Utiliser <strong>{reward.pointsCost} pts</strong> pour «&nbsp;{reward.title}&nbsp;» ?
          </p>
          <p
            style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: "var(--font-size-sm)" }}
          >
            Solde actuel : <strong>{balance} pts</strong>
          </p>
          {insufficientMsg && (
            <p
              style={{
                margin: 0,
                color: "var(--color-destructive)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {insufficientMsg}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)" }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="button" onClick={handleRedeem} disabled={loading}>
              {loading ? "Traitement…" : "Confirmer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
