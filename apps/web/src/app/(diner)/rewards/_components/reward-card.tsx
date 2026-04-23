"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RedeemConfirmDialog } from "./redeem-confirm-dialog";
import type { RewardResponseType } from "@repo/shared-schemas";

interface RewardCardProps {
  reward: RewardResponseType;
  balance: number;
  onRedeemed: (newBalance: number) => void;
}

export function RewardCard({ reward, balance, onRedeemed }: RewardCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const canAfford = balance >= reward.pointsCost;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        padding: "var(--space-md)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      {reward.imageKey && (
        <img
          src={`/api/images/${reward.imageKey}`}
          alt={reward.title}
          style={{
            width: "100%",
            height: "120px",
            objectFit: "cover",
            borderRadius: "var(--radius-md)",
          }}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{reward.title}</span>
          <span
            style={{
              background: "var(--color-surface-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "2px var(--space-xs)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              flexShrink: 0,
            }}
          >
            {reward.pointsCost} pts
          </span>
        </div>
        {reward.description && (
          <p
            style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: "var(--font-size-sm)" }}
          >
            {reward.description}
          </p>
        )}
      </div>
      {canAfford ? (
        <Button type="button" onClick={() => setDialogOpen(true)}>
          Utiliser
        </Button>
      ) : (
        <Button
          type="button"
          disabled
          title={`Il vous manque ${reward.pointsCost - balance} points.`}
        >
          Il vous manque {reward.pointsCost - balance} pts
        </Button>
      )}

      <RedeemConfirmDialog
        reward={reward}
        balance={balance}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRedeemed={onRedeemed}
      />
    </div>
  );
}
