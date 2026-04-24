"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BalanceHero } from "./balance-hero";
import { RewardCard } from "./reward-card";
import type { RewardResponseType } from "@repo/shared-schemas";

type Filter = "all" | "affordable";

interface RewardsListProps {
  rewards: RewardResponseType[];
  initialBalance: number;
}

export function RewardsList({ rewards, initialBalance }: RewardsListProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(() => [...rewards].sort((a, b) => a.pointsCost - b.pointsCost), [rewards]);

  const visible = filter === "all" ? sorted : sorted.filter((r) => balance >= r.pointsCost);
  const affordableCount = sorted.filter((r) => balance >= r.pointsCost).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        paddingBottom: 32,
      }}
    >
      <BalanceHero balance={balance} />

      <div
        style={{
          paddingInline: 16,
          marginTop: 4,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--color-ink-subtle)",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Démo uniquement — récompenses non utilisables chez de vrais restaurants.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Filtrer les récompenses"
        style={{
          display: "flex",
          gap: 14,
          paddingInline: 16,
          paddingTop: 24,
        }}
      >
        <FilterButton
          label="Toutes"
          count={sorted.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterButton
          label="À ma portée"
          count={affordableCount}
          active={filter === "affordable"}
          onClick={() => setFilter("affordable")}
        />
      </div>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingInline: 16,
          paddingTop: 16,
        }}
      >
        {visible.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          visible.map((reward) => (
            <RewardCard key={reward.id} reward={reward} balance={balance} onRedeemed={setBalance} />
          ))
        )}
      </section>

      <div style={{ paddingInline: 16, paddingTop: 20 }}>
        <Link
          href="/chasseur"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-primary)",
            textDecoration: "none",
          }}
        >
          Mes récompenses utilisées
          <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        flex: 1,
        height: 37,
        borderRadius: 8,
        border: active ? "1px solid var(--color-ink)" : "1px solid transparent",
        background: "var(--color-surface)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: "var(--font-weight-bold)",
        lineHeight: "16.2px",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: "var(--font-weight-regular)",
          color: active ? "var(--color-ink-muted)" : "var(--color-placeholder)",
        }}
      >
        ({count})
      </span>
    </button>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const message =
    filter === "affordable"
      ? "Aucune récompense à votre portée pour le moment. Continuez à minter des souvenirs pour accumuler des points."
      : "Aucune récompense disponible pour le moment.";
  return (
    <article
      style={{
        background: "var(--color-surface)",
        borderRadius: 11,
        boxShadow: "0 0 9px 0 rgba(0, 0, 0, 0.07)",
        padding: "24px 18px",
        textAlign: "center",
        color: "var(--color-ink-muted)",
        fontSize: 14,
        lineHeight: "20px",
      }}
    >
      {message}
    </article>
  );
}
