"use client";

/**
 * SouvenirRevealClient — client island for the souvenir reveal page.
 *
 * Responsibilities:
 *  - Read oldBalance / newBalance from sessionStorage (stashed by MintForm
 *    after POST /api/souvenirs succeeds — 04-03-PLAN.md post-mint side effects).
 *  - Track imageLoaded state; flip to true on <img> onLoad.
 *  - Delegate the GSAP timeline to <GsapReveal> which gates on imageLoaded.
 *  - Render reveal-card, reveal-photo, points line with reveal-points span,
 *    and two CTAs pinned near the bottom (reveal-ctas).
 *  - Skeleton (inline display) while !imageLoaded — the <img> still mounts
 *    behind the skeleton so onLoad fires as soon as the browser finishes
 *    decoding the image; GSAP's .from() opacity:0 blur:20px keeps it visually
 *    invisible until the timeline runs.
 *
 * Edge cases (04-04-PLAN.md task 5):
 *  - sessionStorage missing / SSR → oldBalance = 0, newBalance = souvenir.pointsAwarded
 *  - image 404 → onLoad never fires; skeleton persists; console.warn logged via onError
 *
 * Canonical refs:
 *   - 04-04-PLAN.md task 3
 *   - 04-CONTEXT.md D-09 (post-mint routing), D-10 (reveal), D-11 (CTAs)
 *   - BACKEND-CONTRACT.md §Diner — Souvenirs (GET /api/souvenirs/:id)
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GsapReveal } from "./GsapReveal";
import type { SouvenirResponseType } from "@repo/shared-schemas";

interface SouvenirRevealClientProps {
  souvenir: SouvenirResponseType;
}

export function SouvenirRevealClient({ souvenir }: SouvenirRevealClientProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [oldBalance, setOldBalance] = useState(0);
  const [newBalance, setNewBalance] = useState(souvenir.pointsAwarded);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("lastBalance");
      const storedNew = sessionStorage.getItem("newBalance");
      const old = stored !== null ? Number(stored) : 0;
      const nw = storedNew !== null ? Number(storedNew) : old + souvenir.pointsAwarded;
      setOldBalance(old);
      setNewBalance(nw);
      // Clear once consumed so a later reveal of a different souvenir (e.g.
      // opened from the ledger) does not replay a stale oldBalance → newBalance
      // tween. Append-only ledger remains the source of truth for balances.
      sessionStorage.removeItem("lastBalance");
      sessionStorage.removeItem("newBalance");
    } catch {
      // sessionStorage unavailable (private browsing / SSR) → keep defaults
    }
  }, [souvenir.pointsAwarded]);

  return (
    <GsapReveal oldBalance={oldBalance} newBalance={newBalance} imageLoaded={imageLoaded}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
          paddingBottom: "var(--space-2xl)",
        }}
      >
        {/* reveal-card: the flip target — entire card is the flipping element */}
        <Card
          className="reveal-card"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            overflow: "hidden",
          }}
        >
          <CardContent style={{ padding: 0 }}>
            {/* Skeleton shown while image has not loaded */}
            {!imageLoaded && (
              <div
                aria-hidden="true"
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                  background: "var(--color-surface-muted)",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            )}

            {/* Photo — always mounted so onLoad fires; visibility managed by GSAP initial state */}
            {/* Intentional <img>: API-path dynamic image, Next/Image optimizer not wanted here */}
            <img
              src={`/api/images/${souvenir.imageKey}`}
              alt={souvenir.dishName}
              className="reveal-photo"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.warn("souvenir image failed to load:", souvenir.imageKey);
              }}
              style={{
                width: "100%",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                display: "block",
                // Opacity starts at 0; GSAP .from() takes it to 1 on reveal.
                // This prevents a raw-render flash before the timeline fires.
                opacity: imageLoaded ? undefined : 0,
              }}
            />

            {/* Dish info */}
            <div
              style={{
                padding: "var(--space-md)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-xs)",
              }}
            >
              <h1
                style={{
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-ink)",
                  margin: 0,
                  lineHeight: "var(--line-height-xl)",
                }}
              >
                {souvenir.dishName}
              </h1>
              <p
                style={{
                  fontSize: "var(--font-size-base)",
                  color: "var(--color-ink-muted)",
                  margin: 0,
                }}
              >
                {souvenir.restaurantName} · {souvenir.restaurantCity}
              </p>
              {souvenir.note && (
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-ink-muted)",
                    margin: 0,
                    fontStyle: "italic",
                    borderLeft: "2px solid var(--color-border)",
                    paddingLeft: "var(--space-sm)",
                    marginTop: "var(--space-xs)",
                  }}
                >
                  {souvenir.note}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Points line — reveal-points span is the GSAP counter target */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-base)",
              color: "var(--color-ink-muted)",
            }}
          >
            +{souvenir.pointsAwarded} pts — solde :
          </span>
          <strong
            className="reveal-points"
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-accent-gold)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {oldBalance.toLocaleString("fr-FR")}
          </strong>
        </div>

        {/* CTAs — reveal-ctas: fade in last */}
        <div
          className="reveal-ctas"
          style={{
            display: "flex",
            gap: "var(--space-md)",
            marginTop: "var(--space-xl)",
          }}
        >
          <Button style={{ flex: 1 }} render={<Link href="/collection" />}>
            Voir ma collection
          </Button>
          <Button variant="outline" style={{ flex: 1 }} render={<Link href="/scan" />}>
            Scanner à nouveau
          </Button>
        </div>
      </div>
    </GsapReveal>
  );
}
