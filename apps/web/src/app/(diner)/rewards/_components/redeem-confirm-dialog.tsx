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
      router.push("/chasseur");
    } catch (err) {
      if (err instanceof ApiError && err.code === "insufficient_balance") {
        setInsufficientMsg(
          `Pas assez d’étoiles — solde : ${balance}, requis : ${reward.pointsCost}.`,
        );
      } else {
        surfaceApiError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  const formattedCost = reward.pointsCost.toLocaleString("fr-FR");
  const formattedBalance = balance.toLocaleString("fr-FR");
  const formattedAfter = (balance - reward.pointsCost).toLocaleString("fr-FR");

  const StarIcon = () => (
    <img
      src="/images/chasseur/icon-star-mini-red.svg"
      alt=""
      aria-hidden
      width={14}
      height={16}
      style={{ display: "inline-block", verticalAlign: "-2px", marginInline: 2 }}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Échanger une récompense</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <p style={{ margin: 0, fontSize: "var(--font-size-base)" }}>
            Échanger{" "}
            <strong style={{ color: "var(--color-primary)" }}>
              {formattedCost}
              <StarIcon />
            </strong>{" "}
            pour «&nbsp;{reward.title}&nbsp;» ?
          </p>
          <p
            style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: "var(--font-size-sm)" }}
          >
            Solde actuel :{" "}
            <strong>
              {formattedBalance}
              <StarIcon />
            </strong>{" "}
            · Après échange :{" "}
            <strong>
              {formattedAfter}
              <StarIcon />
            </strong>
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
