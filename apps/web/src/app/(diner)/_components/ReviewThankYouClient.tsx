"use client";

/**
 * ReviewThankYouClient — post-review confirmation screen (Figma 59:555).
 *
 * Reads reviewBonus / reviewNewBalance from sessionStorage (stashed by
 * ReviewForm on submit) and renders the "Merci pour ton avis !" hero + two
 * CTAs. Falls back to "1 étoile" if the stash is missing.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

export function ThankYouClient() {
  const [bonus, setBonus] = useState<number>(1);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("reviewBonus");
      if (stored !== null) setBonus(Math.max(1, Number(stored) || 1));
      sessionStorage.removeItem("reviewBonus");
      sessionStorage.removeItem("reviewNewBalance");
    } catch {
      // sessionStorage unavailable — keep default
    }
  }, []);

  const etoileLabel = bonus === 1 ? "1 étoile" : `${bonus} étoiles`;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "var(--color-bg)",
      }}
    >
      {/* Title (top: 120 ± 20) */}
      <h1
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: 100,
          height: 40,
          margin: 0,
          fontFamily: "Roboto, sans-serif",
          fontWeight: 400,
          fontSize: 34,
          color: "var(--color-ink)",
          textAlign: "center",
          lineHeight: "normal",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Merci pour ton avis !
      </h1>

      {/* Subtitle around top: 192.5 (centered) */}
      <p
        style={{
          position: "absolute",
          left: "50%",
          top: 192.5,
          transform: "translate(-50%, -50%)",
          width: 358,
          margin: 0,
          fontFamily: "Roboto, sans-serif",
          fontWeight: 400,
          color: "var(--color-ink)",
          textAlign: "center",
          lineHeight: "17px",
        }}
      >
        <span style={{ fontSize: 13 }}>Grâce à ton retour, tu as gagné </span>
        <span style={{ fontSize: 24, fontWeight: 700 }}>{etoileLabel}</span>
        <br />
        <span style={{ fontSize: 13 }}>
          Continue à partager tes expériences pour en débloquer encore plus !”
        </span>
      </p>

      {/* Hero Michelin flower (Figma inset) */}
      <div
        style={{
          position: "absolute",
          top: "32.82%",
          bottom: "37.93%",
          left: "22.31%",
          right: "22.31%",
        }}
        aria-hidden="true"
      >
        <img
          src="/icons/review/michelin-star-hero.svg"
          alt=""
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      {/* Primary CTA — "Toutes mes étoiles" (filled red) at top:599 */}
      <Link
        href="/chasseur"
        style={{
          position: "absolute",
          top: 599,
          left: 48,
          width: 296,
          height: 44,
          borderRadius: 35,
          background: "var(--color-primary)",
          boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.25)",
          color: "white",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Roboto, sans-serif",
          fontSize: 14,
          lineHeight: "16.2px",
        }}
      >
        <span style={{ position: "relative" }}>Toutes mes étoiles</span>
        <img
          src="/icons/review/michelin-star-small.svg"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            width: 24,
            height: 24,
          }}
        />
      </Link>

      {/* Secondary CTA — outline "Retour à l'accueil" at top:659 */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: 659,
          left: 48,
          width: 296,
          height: 44,
          borderRadius: 35,
          background: "var(--color-bg)",
          border: "1px solid var(--color-ink)",
          boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.25)",
          color: "var(--color-ink)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Roboto, sans-serif",
          fontSize: 14,
          lineHeight: "16.2px",
        }}
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
