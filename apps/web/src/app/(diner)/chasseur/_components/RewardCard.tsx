"use client";

import Image from "next/image";
import { toast } from "sonner";

import { REWARD } from "../_data";

export function RewardCard() {
  function handleUse() {
    toast.success("Bon activé (démo).");
  }

  function handleDetails() {
    toast("Détails à venir.");
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        paddingInline: 16,
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
      <article
        style={{
          position: "relative",
          height: 202,
          background: "var(--color-surface)",
          borderRadius: 11,
          boxShadow: "0 0 9px 0 rgba(0, 0, 0, 0.07)",
          padding: "26px 15px 16px",
        }}
      >
        <Image
          src="/images/chasseur/icon-bib-gourmand.svg"
          alt=""
          width={31}
          height={27}
          style={{
            position: "absolute",
            top: 20,
            right: 30,
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 24,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink)",
            lineHeight: "normal",
            paddingRight: 47,
          }}
        >
          <span
            style={{
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-primary)",
            }}
          >
            {REWARD.discount}
          </span>{" "}
          {REWARD.headlineLead}{" "}
          <span
            style={{
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-primary)",
            }}
          >
            {REWARD.brand}
          </span>
        </p>
        <p
          style={{
            margin: 0,
            marginTop: 12,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink-muted)",
            lineHeight: "17px",
          }}
        >
          {REWARD.description}
        </p>
        <div
          style={{
            position: "absolute",
            left: 13,
            bottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 19,
          }}
        >
          <button
            type="button"
            onClick={handleUse}
            style={{
              width: 140,
              height: 44,
              borderRadius: 35,
              border: "none",
              background: "var(--color-primary)",
              color: "var(--color-primary-fg)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: "var(--font-weight-regular)",
              cursor: "pointer",
              lineHeight: "16.2px",
            }}
          >
            J’utilise mon bon
          </button>
          <button
            type="button"
            onClick={handleDetails}
            style={{
              background: "transparent",
              border: "none",
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
        </div>
      </article>
    </section>
  );
}
