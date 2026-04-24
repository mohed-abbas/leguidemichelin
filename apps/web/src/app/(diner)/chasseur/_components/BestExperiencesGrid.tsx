import Link from "next/link";

export type BestExperienceChip = {
  restaurantId: string;
  name: string;
  thumbnail: string;
  href: string;
};

export function BestExperiencesGrid({ items }: { items: BestExperienceChip[] }) {
  if (items.length === 0) return null;

  const visible = items.slice(0, 4);

  return (
    <section
      aria-labelledby="best-experiences-label"
      style={{
        paddingInline: 16,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <h2
        id="best-experiences-label"
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-bold)",
          lineHeight: "var(--line-height-card)",
          color: "var(--color-chasseur-track)",
        }}
      >
        Meilleurs expériences
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 11,
          rowGap: 11,
        }}
      >
        {visible.map((chip) => (
          <Link
            key={chip.restaurantId}
            href={chip.href}
            style={{
              display: "flex",
              alignItems: "stretch",
              height: 52,
              background: "var(--color-surface)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                flex: "0 0 61px",
                height: 52,
                background: "var(--color-surface-muted)",
              }}
            >
              <img
                src={chip.thumbnail}
                alt=""
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                paddingInline: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-medium)",
                  lineHeight: "var(--line-height-card)",
                  color: "var(--color-ink)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {chip.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
