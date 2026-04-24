import Image from "next/image";
import Link from "next/link";
import { HomeMapPreview } from "./_components/HomeMapPreview";

interface RecentRestaurant {
  id: string;
  name: string;
  thumb: string;
}

// Placeholder content — real data wiring comes with /api/restaurants + /api/me/recent.
const RECENT: RecentRestaurant[] = [
  { id: "1", name: "Frédéric Doucet", thumb: "/images/accueil/recent/1.png" },
  { id: "2", name: "Tata Yoyo", thumb: "/images/accueil/recent/2.png" },
  { id: "3", name: "Maison Ruggieri Palais Royal", thumb: "/images/accueil/recent/3.png" },
  { id: "4", name: "Bistrot là-Haut", thumb: "/images/accueil/recent/4.png" },
];

export default function DinerHomePage() {
  return (
    <div style={{ paddingTop: "88px" }}>
      <h1
        style={{
          margin: 0,
          paddingInline: "14px",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "var(--font-size-h1)",
          lineHeight: "var(--line-height-tight)",
          color: "var(--color-ink)",
        }}
      >
        Restaurants
      </h1>

      {/* Search bar */}
      <form
        role="search"
        action="/restaurants"
        style={{
          marginTop: "var(--space-sm)",
          marginInline: "var(--space-md)",
          height: "57px",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-search)",
          display: "flex",
          alignItems: "center",
          paddingInline: "19px",
          gap: "12px",
        }}
      >
        <span
          aria-hidden
          style={{
            flex: "0 0 28px",
            width: "28px",
            height: "28px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/icons/search.svg" alt="" width={28} height={28} />
        </span>
        <label
          htmlFor="diner-home-search"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Rechercher dans le Guide MICHELIN
        </label>
        <input
          id="diner-home-search"
          type="search"
          name="q"
          placeholder="Rechercher dans le Guide MICHELIN"
          style={{
            flex: 1,
            height: "100%",
            border: 0,
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-regular)",
            fontSize: "var(--font-size-md)",
            color: "var(--color-ink)",
          }}
        />
      </form>

      {/* Vu récemment */}
      <section aria-labelledby="recent-heading" style={{ marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: "var(--space-md)",
          }}
        >
          <h2
            id="recent-heading"
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--font-weight-regular)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-ink-muted)",
            }}
          >
            Vu récemment
          </h2>
          <button
            type="button"
            style={{
              border: 0,
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--font-weight-regular)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-ink-subtle)",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Tout effacer
          </button>
        </div>

        <ul
          style={{
            listStyle: "none",
            margin: 0,
            marginTop: "8px",
            padding: 0,
            paddingInline: "var(--space-md)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "11px",
          }}
        >
          {RECENT.map((r) => (
            <li key={r.id} style={{ display: "flex" }}>
              <Link
                href={`/restaurants/${r.id}`}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  height: "52px",
                  background: "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-card)",
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "var(--color-ink)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: "0 0 52px",
                    width: "52px",
                    height: "52px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Image src={r.thumb} alt="" fill sizes="52px" style={{ objectFit: "cover" }} />
                </span>
                <span
                  style={{
                    flex: 1,
                    paddingInline: "8px",
                    fontFamily: "var(--font-sans)",
                    fontWeight: "var(--font-weight-medium)",
                    fontSize: "var(--font-size-xs)",
                    lineHeight: "var(--line-height-card)",
                    color: "var(--color-ink)",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {r.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Autour de moi */}
      <section aria-labelledby="around-me-heading" style={{ marginTop: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: "var(--space-md)",
          }}
        >
          <h2
            id="around-me-heading"
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--font-weight-bold)",
              fontSize: "var(--font-size-h2)",
              color: "var(--color-ink)",
            }}
          >
            Autour de moi
          </h2>
          <Link
            href="/map"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--font-weight-regular)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-ink-subtle)",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Tout Voir
          </Link>
        </div>

        <div
          style={{
            marginTop: "10px",
            marginInline: "var(--space-sm)",
            aspectRatio: "358 / 200",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <HomeMapPreview />
        </div>
      </section>

      {/* Les nouveaux 3 & 2 Étoiles */}
      <section
        aria-labelledby="new-stars-heading"
        style={{ marginTop: "32px", paddingInline: "var(--space-md)" }}
      >
        <h2
          id="new-stars-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-lg)",
            color: "var(--color-ink)",
          }}
        >
          Les nouveaux 3 &amp; 2 Étoiles
        </h2>
        <p
          style={{
            margin: 0,
            marginTop: "4px",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-regular)",
            fontSize: "var(--font-size-2xs)",
            color: "var(--color-ink-subtle)",
          }}
        >
          France 2026
        </p>
      </section>
    </div>
  );
}
