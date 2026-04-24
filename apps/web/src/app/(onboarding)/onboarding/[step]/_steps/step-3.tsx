"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Onboarding 3/6 — "À toi de jouer !" (Figma node 0:786).
 *
 * The hand-off. A framed map preview drops in from above, the CTA headline
 * pops, and the progress moves to the third dash. Last narrative beat — next
 * screen starts the "how it works" flow.
 */
const AUTO_ADVANCE_MS = 5000;

export function StepThree() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const autoTimer = window.setTimeout(() => {
      if (!leavingRef.current) advanceTo("/onboarding/4");
    }, AUTO_ADVANCE_MS);

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-anim]", { opacity: 1, scale: 1, y: 0 });
        gsap.set("[data-anim='dash-active']", { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        "[data-anim='map']",
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" },
        0.1,
      )
        .to(
          "[data-anim='title-bold']",
          {
            opacity: 1,
            scale: 1,
            duration: 0.55,
            ease: "back.out(2)",
          },
          0.65,
        )
        .to("[data-anim='title-rest']", { opacity: 1, x: 0, duration: 0.5 }, 0.85)
        .to("[data-anim='body']", { opacity: 1, y: 0, duration: 0.55 }, 1.2)
        .to("[data-anim='dash']", { opacity: 0.35, duration: 0.4, stagger: 0.05 }, 1.5)
        .to(
          "[data-anim='dash-active']",
          { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.inOut" },
          1.85,
        )
        .to("[data-anim='skip']", { opacity: 1, duration: 0.4 }, 2.0);
    }, rootRef);

    return () => {
      window.clearTimeout(autoTimer);
      ctx.revert();
    };
  }, []);

  const advanceTo = (href: string) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      router.push(href);
      return;
    }
    gsap.to(rootRef.current!.querySelectorAll("[data-anim]"), {
      opacity: 0,
      y: -16,
      duration: 0.3,
      stagger: 0.02,
      ease: "power2.in",
      onComplete: () => router.push(href),
    });
  };

  const handleNext = () => advanceTo("/onboarding/4");
  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    advanceTo("/");
  };

  return (
    <div
      ref={rootRef}
      onClick={handleNext}
      role="button"
      tabIndex={0}
      aria-label="Continuer l’onboarding"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNext();
        }
      }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "390px",
        marginInline: "auto",
        minHeight: "100dvh",
        background: "var(--color-primary)",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Map preview — Figma crops a 1170×2532 frame-shot to a 314×217 window
          (the same overflow pattern as the splash mascot). Percentages
          preserved from the payload. */}
      <div
        data-anim="map"
        style={{
          position: "absolute",
          top: "182px",
          left: "38px",
          width: "314px",
          height: "217px",
          overflow: "hidden",
          opacity: 0,
          transform: "translateY(-32px) scale(0.96)",
          transformOrigin: "center top",
          boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.22)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "313.15%",
            left: 0,
            top: "-156.5%",
          }}
        >
          <Image
            src="/images/onboarding/map-preview.png"
            alt=""
            fill
            priority
            sizes="314px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Headline: "À toi de jouer !" — "À toi" bold as the emphasis */}
      <div
        style={{
          margin: 0,
          position: "absolute",
          top: "486px" /* 526 center − 80/2 */,
          left: "50%",
          transform: "translateX(-50%)",
          width: "286px",
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          fontSize: "34px",
          lineHeight: "normal",
          color: "var(--color-primary-fg)",
          fontVariationSettings: "'wdth' 100",
          whiteSpace: "nowrap",
        }}
      >
        <span
          data-anim="title-bold"
          style={{
            display: "inline-block",
            fontWeight: "var(--font-weight-bold)",
            opacity: 0,
            transform: "scale(0.6)",
            transformOrigin: "center",
          }}
        >
          À toi
        </span>
        <span
          data-anim="title-rest"
          style={{
            display: "inline-block",
            fontWeight: "var(--font-weight-regular)",
            opacity: 0,
            transform: "translateX(-8px)",
          }}
        >
          &nbsp;de jouer !
        </span>
      </div>

      {/* Body copy — smaller (13px) than the prior two screens */}
      <p
        data-anim="body"
        style={{
          margin: 0,
          position: "absolute",
          top: "583px",
          left: "38px",
          right: "38px",
          height: "88px",
          opacity: 0,
          transform: "translateY(12px)",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "13px",
          lineHeight: "17px",
          color: "var(--color-primary-fg)",
          textAlign: "center",
          fontVariationSettings: "'wdth' 100",
        }}
      >
        Aujourd’hui, c’est à toi de devenir Chasseur d’étoiles.
        <br />
        Explore les meilleures adresses du Guide.
      </p>

      {/* Progress dashes — position 3 is active */}
      <ProgressDash left={67} />
      <ProgressDash left="calc(25% + 13.5px)" />
      <ProgressDash left="calc(25% + 57.5px)" active />
      <ProgressDash left="calc(50% + 4px)" />
      <ProgressDash left="calc(50% + 48px)" />
      <ProgressDash left="calc(75% - 5.5px)" />

      <button
        type="button"
        data-anim="skip"
        onClick={handleSkip}
        style={{
          position: "absolute",
          top: "809px",
          left: "16px",
          right: "16px",
          transform: "translateY(-50%)",
          height: "30px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "13px",
          lineHeight: "17px",
          color: "var(--color-primary-fg)",
          textAlign: "center",
          textDecoration: "underline",
          textDecorationSkipInk: "none",
          opacity: 0,
        }}
      >
        Passer l’intro
      </button>
    </div>
  );
}

function ProgressDash({ left, active = false }: { left: number | string; active?: boolean }) {
  return (
    <div
      data-anim={active ? "dash-active" : "dash"}
      style={{
        position: "absolute",
        top: "736px",
        left: typeof left === "number" ? `${left}px` : left,
        width: "37px",
        height: "3px",
        background: "var(--color-primary-fg)",
        opacity: 0,
        transform: active ? "scaleX(0)" : "none",
        transformOrigin: "left center",
        borderRadius: "2px",
      }}
    />
  );
}
