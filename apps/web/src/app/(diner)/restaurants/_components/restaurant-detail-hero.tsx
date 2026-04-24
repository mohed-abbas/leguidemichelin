import Link from "next/link";
import type { RestaurantResponseType } from "@repo/shared-schemas";

interface RestaurantDetailHeroProps {
  restaurant: RestaurantResponseType;
}

export function RestaurantDetailHero({ restaurant: r }: RestaurantDetailHeroProps) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "390 / 396" }}>
      {r.heroImageKey ? (
        <img
          src={`/api/images/${r.heroImageKey}`}
          alt={`Photo de ${r.name}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--color-surface-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--font-size-h1)",
            color: "var(--color-ink-muted)",
          }}
        >
          {r.name[0]}
        </div>
      )}

      <Link
        href="/restaurants"
        aria-label="Retour"
        style={{
          position: "absolute",
          top: "20px",
          left: "16px",
          width: "29px",
          height: "29px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-full)",
          textDecoration: "none",
        }}
      >
        <svg
          width="14"
          height="11"
          viewBox="0 0 15 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M0.434315 6.56569C0.12189 6.25327 0.12189 5.74674 0.434315 5.43432L5.52548 0.343143C5.8379 0.0307242 6.34443 0.0307242 6.65685 0.343143C6.96927 0.655562 6.96927 1.1621 6.65685 1.47452L2.13137 6L6.65685 10.5255C6.96927 10.8379 6.96927 11.3444 6.65685 11.6569C6.34443 11.9693 5.8379 11.9693 5.52548 11.6569L0.434315 6.56569ZM15 6V6.8H1V6V5.2H15V6Z"
            fill="var(--color-ink)"
          />
        </svg>
      </Link>
    </div>
  );
}
