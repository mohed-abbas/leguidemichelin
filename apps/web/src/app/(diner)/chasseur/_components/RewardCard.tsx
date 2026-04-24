"use client";

import Image from "next/image";
import Link from "next/link";

import type { RewardResponseType } from "@repo/shared-schemas";

interface Props {
  rewards: RewardResponseType[];
  balance: number;
}

function formatPoints(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function RewardCard({ rewards, balance }: Props) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingInline: 16,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-placeholder)",
            lineHeight: "16.2px",
          }}
        >
          Mes récompenses
        </h2>
        <span
          style={{
            fontSize: 13,
            color: "var(--color-ink-muted)",
            fontWeight: "var(--font-weight-bold)",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Solde :{" "}
          <span
            style={{
              color: "var(--color-primary)",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            {formatPoints(balance)}
            <Image
              src="/images/chasseur/icon-star-mini-red.svg"
              alt=""
              width={12}
              height={14}
              aria-hidden
            />
          </span>
        </span>
      </header>

      {rewards.length === 0 ? (
        <EmptyRewardCard />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rewards.map((r) => (
            <RewardRow key={r.id} reward={r} balance={balance} />
          ))}
        </div>
      )}

      <Link
        href="/rewards"
        style={{
          alignSelf: "flex-start",
          marginTop: 4,
          fontSize: 14,
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-primary)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        Voir toutes les récompenses
        <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
          →
        </span>
      </Link>
    </section>
  );
}

function RewardRow({ reward, balance }: { reward: RewardResponseType; balance: number }) {
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
        style={{ position: "absolute", top: 22, right: 18, flex: "0 0 auto" }}
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
        <Link
          href="/rewards"
          aria-disabled={!affordable}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 44,
            borderRadius: 35,
            background: affordable ? "var(--color-primary)" : "var(--color-chasseur-track)",
            color: "var(--color-primary-fg)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: "var(--font-weight-regular)",
            lineHeight: "16.2px",
            textDecoration: "none",
            pointerEvents: affordable ? "auto" : "none",
          }}
        >
          J’utilise mon bon
        </Link>

        {affordable ? (
          <Link
            href="/rewards"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: "var(--font-weight-regular)",
              color: "var(--color-ink)",
              lineHeight: "16.2px",
              textDecoration: "none",
            }}
          >
            Détails
          </Link>
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
    </article>
  );
}

function EmptyRewardCard() {
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
      Aucune récompense disponible pour le moment. Continuez à minter des souvenirs pour accumuler
      des points.
    </article>
  );
}
