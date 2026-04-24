"use client";

import { useState, type ReactNode } from "react";
import { useFavoriteToggle } from "../../_hooks/useFavoriteToggle";

interface ActionCardProps {
  label: string;
  toggle?: { pressed: boolean; onToggle: () => void };
  onClick?: () => void;
  pending?: boolean;
  children: ReactNode;
}

function ActionCard({ label, toggle, onClick, pending, children }: ActionCardProps) {
  const pressed = toggle?.pressed ?? false;
  const handleClick = toggle ? toggle.onToggle : onClick;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        flex: 1,
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={toggle ? pressed : undefined}
        aria-busy={pending ? true : undefined}
        aria-label={label}
        style={{
          width: "100%",
          height: "50px",
          background: "var(--color-surface)",
          border: "none",
          borderRadius: "7px",
          boxShadow: "0 1px 12px 0 rgb(0 0 0 / 0.16)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          color: pressed ? "var(--color-primary)" : "var(--color-ink)",
          opacity: pending ? 0.6 : 1,
          pointerEvents: pending ? "none" : "auto",
        }}
      >
        {children}
      </button>
      <span
        style={{
          fontSize: "11px",
          color: "var(--color-ink)",
          lineHeight: 1,
          fontFamily: "var(--font-sans)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" aria-hidden>
      <path
        d="M11 18.35l-1.45-1.32C4.4 12.36 1 9.28 1 5.5 1 2.42 3.42 0 6.5 0c1.74 0 3.41 0.81 4.5 2.09C12.09 0.81 13.76 0 15.5 0 18.58 0 21 2.42 21 5.5c0 3.78-3.4 6.86-8.55 11.54L11 18.35z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden>
      <path
        d="M1 1h14v20l-7-4.5L1 21V1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

function CheckCircleIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="10"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={filled ? "currentColor" : "none"}
      />
      <path
        d="M6.5 11.5l3 3 6-6"
        stroke={filled ? "var(--color-surface)" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="14"
        height="18"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="6"
        y="1"
        width="6"
        height="4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="var(--color-surface)"
      />
      <path
        d="M5.5 10h7M5.5 13h7M5.5 16h4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface RestaurantActionCardsProps {
  initialFavorited: boolean;
  restaurantId: string;
}

export function RestaurantActionCards({
  initialFavorited,
  restaurantId,
}: RestaurantActionCardsProps) {
  // Single hook call — reads favorited + hydrated from the store in one
  // subscription (Plan 06 exposes hydrated on the hook return). Do NOT add a
  // second store subscription for hydrated in this component.
  const { favorited, toggle, isPending, hydrated } = useFavoriteToggle(restaurantId);

  // Until the client store hydrates, fall back to the server-injected initial
  // value so there's no false→true flicker on refresh for a favorited
  // restaurant (SPEC Req 7).
  const displayFavorited = hydrated ? favorited : initialFavorited;

  // TODO(Phase 5+): wire Enregistrer (Bookmark) — requires Bookmark model + endpoints.
  const [saved, setSaved] = useState(false);
  // TODO(Phase 5+): wire Déja visité (Visited) — requires Visited model or derive from souvenirs.
  const [visited, setVisited] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        gap: "11px",
        paddingInline: "16px",
      }}
    >
      <ActionCard
        label="Favori"
        toggle={{ pressed: displayFavorited, onToggle: toggle }}
        pending={isPending}
      >
        <HeartIcon filled={displayFavorited} />
      </ActionCard>
      <ActionCard
        label="Enregistrer"
        toggle={{ pressed: saved, onToggle: () => setSaved((v) => !v) }}
      >
        <BookmarkIcon filled={saved} />
      </ActionCard>
      <ActionCard
        label="Déja visité"
        toggle={{ pressed: visited, onToggle: () => setVisited((v) => !v) }}
      >
        <CheckCircleIcon filled={visited} />
      </ActionCard>
      <ActionCard label="Remarques" onClick={() => {}}>
        <ClipboardIcon />
      </ActionCard>
    </div>
  );
}
