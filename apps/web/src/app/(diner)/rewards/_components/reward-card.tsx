"use client";

import Image from "next/image";
import { useState } from "react";
import { RedeemConfirmDialog } from "./redeem-confirm-dialog";
import type { RewardResponseType } from "@repo/shared-schemas";

interface RewardCardProps {
  reward: RewardResponseType;
  balance: number;
  onRedeemed: (newBalance: number) => void;
}

function formatPoints(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function RewardCard({ reward, balance, onRedeemed }: RewardCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const affordable = balance >= reward.pointsCost;

  return (
    <article
      style={{
        position: "relative",
        background: "var(--color-surface)",
        borderRadius: 11,
        boxShadow: "0 0 9px 0 rgba(0, 0, 0, 0.07)",
        padding: "24px 16px 22px 15px",
        minHeight: 202,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Image
        src="/images/chasseur/icon-bib-gourmand.svg"
        alt=""
        width={36}
        height={31}
        aria-hidden
        style={{
          position: "absolute",
          top: 22,
          right: 18,
          flex: "0 0 auto",
        }}
      />

      <h3
        style={{
          margin: 0,
          paddingRight: 60,
          fontFamily: "var(--font-sans)",
          fontSize: 24,
          fontWeight: "var(--font-weight-regular)",
          color: "var(--color-ink)",
          lineHeight: 1.15,
        }}
      >
        {reward.title}
      </h3>

      {reward.description ? (
        <p
          style={{
            margin: "13px 18px 0 0",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink-muted)",
            lineHeight: "17px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {reward.description}
        </p>
      ) : null}

      <div
        style={{
          marginTop: "auto",
          paddingTop: 24,
          paddingLeft: 13,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={!affordable}
          style={{
            appearance: "none",
            border: "none",
            width: 140,
            height: 44,
            borderRadius: 35,
            background: affordable ? "var(--color-primary)" : "var(--color-chasseur-track)",
            color: "var(--color-primary-fg)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: "var(--font-weight-regular)",
            lineHeight: "16.2px",
            cursor: affordable ? "pointer" : "not-allowed",
          }}
        >
          J’utilise mon bon
        </button>

        {affordable ? (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            style={{
              appearance: "none",
              border: "none",
              background: "transparent",
              padding: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: "var(--font-weight-regular)",
              color: "var(--color-ink)",
              lineHeight: "16.2px",
              cursor: "pointer",
            }}
          >
            Détails
          </button>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: "var(--font-weight-regular)",
              color: "var(--color-ink-muted)",
              lineHeight: "16.2px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            Encore {formatPoints(reward.pointsCost - balance)}
            <Image
              src="/images/chasseur/icon-star-mini-red.svg"
              alt=""
              width={14}
              height={16}
              aria-hidden
            />
          </span>
        )}
      </div>

      <RedeemConfirmDialog
        reward={reward}
        balance={balance}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRedeemed={onRedeemed}
      />
    </article>
  );
}
