"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Onboarding 1/6 — "Deviens Chasseur d'Étoiles" origin story
 * (Figma node 0:754). Whole surface advances; the "Passer l'intro"
 * link skips to home.
 *
 * GSAP choreography matches the narrative: the photo is laid like a
 * framed portrait, the caption writes itself in like a signature, and
 * the title rises in two beats (Deviens → Chasseur d'Étoiles) before
 * the body copy lands and the progress bar locks to step 1.
 */
export function StepOne() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-anim]", { opacity: 1, y: 0, clipPath: "inset(0 0 0 0)" });
        gsap.set("[data-anim='dash-active']", { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-anim='pill']", { opacity: 1, y: 0, duration: 0.5 }, 0.1)
        .to("[data-anim='card']", { opacity: 1, y: 0, duration: 0.7 }, 0.15)
        .to("[data-anim='photo']", { scale: 1, duration: 1.1, ease: "power2.out" }, 0.3)
        .to(
          "[data-anim='caption']",
          { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 1.2, ease: "power1.inOut" },
          0.85,
        )
        .to("[data-anim='title-1']", { opacity: 1, y: 0, duration: 0.6 }, 1.25)
        .to("[data-anim='title-2']", { opacity: 1, y: 0, duration: 0.7 }, 1.45)
        .to("[data-anim='body']", { opacity: 1, y: 0, duration: 0.6 }, 1.85)
        .to("[data-anim='dash']", { opacity: 0.35, duration: 0.4, stagger: 0.06 }, 2.15)
        .to(
          "[data-anim='dash-active']",
          { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.inOut" },
          2.5,
        )
        .to("[data-anim='skip']", { opacity: 1, duration: 0.4 }, 2.6);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const advanceTo = (href: string) => {
    if (leaving) return;
    setLeaving(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      router.push(href);
      return;
    }
    const root = rootRef.current!;
    const tl = gsap.timeline({ onComplete: () => router.push(href) });
    // Photo card tilts + flies out stage-left (matches Figma's hint for the 1→2 transition)
    tl.to(
      root.querySelector("[data-anim='card']"),
      {
        x: -455,
        rotation: -22.26,
        opacity: 0,
        duration: 0.55,
        ease: "power2.in",
        transformOrigin: "50% 50%",
      },
      0,
    );
    // Everything else fades up
    tl.to(
      root.querySelectorAll(
        "[data-anim='pill'], [data-anim='title-1'], [data-anim='title-2'], [data-anim='body'], [data-anim='dash'], [data-anim='dash-active'], [data-anim='skip']",
      ),
      {
        opacity: 0,
        y: -16,
        duration: 0.3,
        stagger: 0.02,
        ease: "power2.in",
      },
      0,
    );
  };

  const handleNext = () => advanceTo("/onboarding/2");
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
      {/* "Nouveau" pill — top-right chrome */}
      <div
        data-anim="pill"
        style={{
          position: "absolute",
          top: "64px",
          left: "calc(75% - 8.5px)",
          width: "90px",
          height: "24px",
          borderRadius: "8px",
          background: "var(--color-surface)",
          opacity: 0,
          transform: "translateY(-8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "16px",
          lineHeight: "22px",
          color: "var(--color-primary)",
          fontVariationSettings: "'wdth' 100",
        }}
      >
        Nouveau
      </div>

      {/* White photo card */}
      <div
        data-anim="card"
        style={{
          position: "absolute",
          top: "134px",
          left: "38px",
          width: "314px",
          height: "281px",
          background: "var(--color-surface)",
          opacity: 0,
          transform: "translateY(24px)",
          boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "11px" /* 145 − 134 */,
            left: "12px" /* 50 − 38 */,
            width: "291px",
            height: "194px",
            overflow: "hidden",
          }}
        >
          <div
            data-anim="photo"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transform: "scale(1.08)",
              transformOrigin: "center",
            }}
          >
            <Image
              src="/images/onboarding/saga-04-andre-edouard.png"
              alt="André et Édouard Michelin, 1900"
              fill
              priority
              sizes="291px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <div
          data-anim="caption"
          style={{
            position: "absolute",
            top: "205px" /* 339 frame − 134 card, so caption sits in the bottom white margin */,
            left: "50%",
            transform: "translateX(-50%)",
            width: "286px",
            height: "76px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-handwriting), cursive",
            fontWeight: 400,
            fontSize: "22px",
            lineHeight: "normal",
            color: "var(--color-ink)",
            textAlign: "center",
            clipPath: "inset(0 100% 0 0)",
            opacity: 0,
          }}
        >
          <span style={{ display: "block" }}>André et Edouard</span>
          <span style={{ display: "block" }}>Michelin</span>
        </div>
      </div>

      {/* Headline: "Deviens / Chasseur d'Étoiles" */}
      <p
        style={{
          margin: 0,
          position: "absolute",
          top: "486px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "286px",
          height: "80px",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
          fontSize: "34px",
          lineHeight: "normal",
          color: "var(--color-primary-fg)",
          fontVariationSettings: "'wdth' 100",
        }}
      >
        <span
          data-anim="title-1"
          style={{
            display: "block",
            fontWeight: "var(--font-weight-regular)",
            opacity: 0,
            transform: "translateY(18px)",
          }}
        >
          Deviens
        </span>
        <span
          data-anim="title-2"
          style={{
            display: "block",
            fontWeight: "var(--font-weight-bold)",
            opacity: 0,
            transform: "translateY(18px)",
          }}
        >
          Chasseur d’Étoiles
        </span>
      </p>

      {/* Body copy */}
      <div
        data-anim="body"
        style={{
          position: "absolute",
          top: "590px",
          left: "16px",
          right: "16px",
          height: "66px",
          opacity: 0,
          transform: "translateY(12px)",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "16px",
          lineHeight: "22px",
          color: "var(--color-primary-fg)",
          textAlign: "center",
          fontVariationSettings: "'wdth' 100",
        }}
      >
        <p style={{ margin: 0 }}>
          En 1900, Les frères Michelin André et Édouard
          <br />
          créent un guide pour aider les voyageurs
        </p>
        <p style={{ margin: 0 }}>à trouver où manger sur la route.</p>
      </div>

      {/* Progress dashes (6 × 37px). First is the active/bright one. */}
      <ProgressDash left={67} active />
      <ProgressDash left="calc(25% + 13.5px)" />
      <ProgressDash left="calc(25% + 57.5px)" />
      <ProgressDash left="calc(50% + 4px)" />
      <ProgressDash left="calc(50% + 48px)" />
      <ProgressDash left="calc(75% - 5.5px)" />

      {/* Skip link */}
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
