interface Reviewer {
  initial: string;
  bg: string;
  fg: string;
}

const DEMO_REVIEWERS: Reviewer[] = [
  {
    initial: "G",
    bg: "color-mix(in oklab, var(--color-success) 18%, var(--color-surface))",
    fg: "var(--color-ink)",
  },
  {
    initial: "M",
    bg: "color-mix(in oklab, var(--color-info) 18%, var(--color-surface))",
    fg: "var(--color-ink)",
  },
  {
    initial: "S",
    bg: "color-mix(in oklab, var(--color-primary) 14%, var(--color-surface))",
    fg: "var(--color-ink)",
  },
];

interface RestaurantReviewersRowProps {
  likes: number;
  reviewers: number;
}

export function RestaurantReviewersRow({ likes, reviewers }: RestaurantReviewersRowProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        paddingInline: "16px",
      }}
    >
      <div style={{ display: "flex", gap: "11px" }}>
        {DEMO_REVIEWERS.map((r) => (
          <div
            key={r.initial}
            aria-hidden
            style={{
              width: "39px",
              height: "39px",
              borderRadius: "var(--radius-full)",
              background: r.bg,
              color: r.fg,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "var(--font-weight-medium)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {r.initial}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--color-ink)",
          fontSize: "13px",
          lineHeight: "17px",
          fontFamily: "var(--font-sans)",
        }}
      >
        <svg width="17" height="14" viewBox="0 0 17 14" fill="none" aria-hidden>
          <path
            d="M8.5 13.5S0.5 8.7 0.5 4.5C0.5 2.29 2.29 0.5 4.5 0.5c1.37 0 2.6 0.7 3.3 1.76C8.5 2.7 8.5 2.7 8.5 2.7s0.7-1 1.2-1.44C10.4 0.82 11.43 0.5 12.5 0.5c2.21 0 4 1.79 4 4 0 4.2-8 9-8 9z"
            fill="var(--color-primary)"
          />
        </svg>
        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{likes}</span>

        <img
          src="/icons/map/flower-emblem.svg"
          alt=""
          width={14}
          height={16}
          style={{ marginLeft: "6px", display: "inline-block", flexShrink: 0 }}
        />
        <span>
          <a
            href="#reviews"
            style={{
              color: "inherit",
              fontWeight: "var(--font-weight-semibold)",
              textDecoration: "underline",
            }}
          >
            {reviewers} Chasseurs
          </a>{" "}
          ont donné leur avis
        </span>
      </div>
    </div>
  );
}
