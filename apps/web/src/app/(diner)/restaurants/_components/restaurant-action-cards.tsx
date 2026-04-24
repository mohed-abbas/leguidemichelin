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

function ActionIcon({
  src,
  width,
  height,
  pressed,
}: {
  src: string;
  width: number;
  height: number;
  pressed?: boolean;
}) {
  return (
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      aria-hidden
      style={{
        display: "block",
        width: `${width}px`,
        height: `${height}px`,
        // Pressed → tint with primary color by swapping the stroke/fill CSS var
        // that Figma exports embed (var(--stroke-0, …) / var(--fill-0, …)).
        filter: pressed
          ? "brightness(0) saturate(100%) invert(17%) sepia(76%) saturate(4901%) hue-rotate(343deg) brightness(87%) contrast(103%)"
          : undefined,
      }}
    />
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
        <ActionIcon
          src="/icons/actions/heart.svg"
          width={19}
          height={18}
          pressed={displayFavorited}
        />
      </ActionCard>
      <ActionCard
        label="Enregistrer"
        toggle={{ pressed: saved, onToggle: () => setSaved((v) => !v) }}
      >
        <ActionIcon src="/icons/actions/bookmark.svg" width={14} height={16} pressed={saved} />
      </ActionCard>
      <ActionCard
        label="Déja visité"
        toggle={{ pressed: visited, onToggle: () => setVisited((v) => !v) }}
      >
        <ActionIcon src="/icons/actions/check.svg" width={17} height={17} pressed={visited} />
      </ActionCard>
      <ActionCard label="Remarques" onClick={() => {}}>
        <ActionIcon src="/icons/actions/clipboard.svg" width={14} height={17} />
      </ActionCard>
    </div>
  );
}
