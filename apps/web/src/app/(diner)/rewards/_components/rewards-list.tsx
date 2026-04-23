"use client";

import { useState } from "react";
import { RewardCard } from "./reward-card";
import type { RewardResponseType } from "@repo/shared-schemas";

interface RewardsListProps {
  rewards: RewardResponseType[];
  initialBalance: number;
}

export function RewardsList({ rewards, initialBalance }: RewardsListProps) {
  const [balance, setBalance] = useState(initialBalance);

  const sorted = [...rewards].sort((a, b) => a.pointsCost - b.pointsCost);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-md)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <span style={{ color: "var(--color-ink-muted)" }}>Votre solde</span>
        <span
          style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-lg)" }}
        >
          {balance} pts
        </span>
      </div>

      <div
        style={{
          padding: "var(--space-sm) var(--space-md)",
          background: "var(--color-surface-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-ink-muted)",
        }}
      >
        ⚠ Démo uniquement — récompenses non utilisables chez de vrais restaurants.
      </div>

      {sorted.length === 0 ? (
        <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>
          Aucune récompense disponible pour le moment.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          {sorted.map((reward) => (
            <RewardCard key={reward.id} reward={reward} balance={balance} onRedeemed={setBalance} />
          ))}
        </div>
      )}
    </div>
  );
}
