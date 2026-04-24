import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FooterDisclaimer } from "@/components/footer-disclaimer";

export default function NotFound() {
  return (
    <main
      id="main"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
      }}
    >
      <section
        aria-labelledby="not-found-heading"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingInline: "var(--space-lg)",
          paddingBlock: "var(--space-2xl)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative wandering trail — dotted path off-map */}
        <svg
          aria-hidden
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.45,
          }}
        >
          <path
            d="M -20 320 C 120 280, 180 220, 260 230 S 420 300, 520 200 S 640 60, 720 90"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 10"
          />
          <path
            d="M -40 150 C 80 170, 160 120, 240 140 S 380 220, 480 170"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="2 14"
            opacity="0.7"
          />
        </svg>

        {/* Eyebrow */}
        <p
          style={{
            position: "relative",
            margin: 0,
            marginBottom: "var(--space-md)",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-medium)",
            fontSize: "var(--font-size-xs)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--color-ink-subtle)",
          }}
        >
          Erreur 404 &nbsp;·&nbsp; Hors Guide
        </p>

        {/* 404 + Pin composition */}
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(4px, 2vw, 16px)",
            marginBottom: "var(--space-lg)",
          }}
        >
          <span
            aria-hidden
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--font-weight-bold)",
              fontSize: "clamp(6rem, 22vw, 11rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              color: "var(--color-primary)",
            }}
          >
            4
          </span>

          <span
            className="gfj-404-pin"
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "flex-end",
              height: "clamp(6rem, 22vw, 11rem)",
              paddingBottom: "clamp(0.4rem, 2vw, 1rem)",
            }}
          >
            <Image
              src="/pins/pin-starred-red.svg"
              alt=""
              width={63}
              height={74}
              priority
              style={{
                width: "clamp(64px, 14vw, 104px)",
                height: "auto",
                filter: "drop-shadow(var(--shadow-md))",
              }}
            />
          </span>

          <span
            aria-hidden
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--font-weight-bold)",
              fontSize: "clamp(6rem, 22vw, 11rem)",
              lineHeight: 0.9,
              letterSpacing: "-0.06em",
              color: "var(--color-primary)",
            }}
          >
            4
          </span>
        </div>

        {/* Gold accent rule */}
        <span
          aria-hidden
          style={{
            display: "block",
            width: "40px",
            height: "2px",
            background: "var(--color-accent-gold)",
            marginBottom: "var(--space-md)",
            borderRadius: "var(--radius-full)",
          }}
        />

        <h1
          id="not-found-heading"
          style={{
            position: "relative",
            margin: 0,
            maxWidth: "28ch",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-h1)",
            lineHeight: "var(--line-height-xl)",
            color: "var(--color-ink)",
          }}
        >
          Cette adresse ne figure pas au Guide.
        </h1>

        <p
          style={{
            position: "relative",
            margin: 0,
            marginTop: "var(--space-md)",
            maxWidth: "42ch",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-regular)",
            fontSize: "var(--font-size-base)",
            lineHeight: "var(--line-height-base)",
            color: "var(--color-ink-muted)",
          }}
        >
          On dirait que votre chemin s’est perdu entre deux étoiles. Reprenez la carte — il y a
          encore tant de souvenirs à collectionner.
        </p>

        {/* Actions */}
        <div
          style={{
            position: "relative",
            marginTop: "var(--space-xl)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-sm)",
            justifyContent: "center",
          }}
        >
          <Link href="/">
            <Button
              type="button"
              size="lg"
              style={{
                height: "var(--touch-target-min)",
                paddingInline: "var(--space-lg)",
                fontSize: "var(--font-size-base)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              Retour à l’accueil
            </Button>
          </Link>
          <Link href="/map">
            <Button
              type="button"
              size="lg"
              variant="outline"
              style={{
                height: "var(--touch-target-min)",
                paddingInline: "var(--space-lg)",
                fontSize: "var(--font-size-base)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              Explorer la carte
            </Button>
          </Link>
        </div>
      </section>

      <FooterDisclaimer />

      {/* Subtle float on the pin. Reduced-motion clamps via tokens. */}
      <style>{`
        .gfj-404-pin {
          animation: gfj-pin-float var(--duration-slow) var(--ease-standard);
        }
        .gfj-404-pin img {
          animation: gfj-pin-bob 3.2s var(--ease-standard) 600ms infinite;
          transform-origin: 50% 100%;
        }
        @keyframes gfj-pin-float {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gfj-pin-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gfj-404-pin, .gfj-404-pin img { animation: none; }
        }
      `}</style>
    </main>
  );
}
