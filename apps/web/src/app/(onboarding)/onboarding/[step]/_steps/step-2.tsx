"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Onboarding 2/6 — "Les Étoiles du Guide" (Figma node 0:770).
 *
 * The star icon stamps in like a seal, then the headline and body copy
 * land, then the progress bar advances its active dash from position 1 to 2.
 */
const AUTO_ADVANCE_MS = 5000;

export function StepTwo() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const autoTimer = window.setTimeout(() => {
      if (!leavingRef.current) advanceTo("/onboarding/3");
    }, AUTO_ADVANCE_MS);

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-anim]", { opacity: 1, scale: 1, rotation: 0, y: 0 });
        gsap.set("[data-anim='dash-active']", { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        "[data-anim='star']",
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1.1,
          ease: "elastic.out(1, 0.6)",
        },
        0.1,
      )
        .to("[data-anim='title-1']", { opacity: 1, y: 0, duration: 0.6 }, 0.9)
        .to("[data-anim='title-2']", { opacity: 1, y: 0, duration: 0.6 }, 1.1)
        .to("[data-anim='body']", { opacity: 1, y: 0, duration: 0.6 }, 1.5)
        .to("[data-anim='dash']", { opacity: 0.35, duration: 0.4, stagger: 0.05 }, 1.8)
        .to(
          "[data-anim='dash-active']",
          { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.inOut" },
          2.1,
        )
        .to("[data-anim='skip']", { opacity: 1, duration: 0.4 }, 2.3)
        .to(
          "[data-anim='star']",
          {
            scale: 1.03,
            duration: 2.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
          "+=0.1",
        );
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

  const handleNext = () => advanceTo("/onboarding/3");
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
      {/* Star / flower hero */}
      <div
        data-anim="star"
        style={{
          position: "absolute",
          top: "168px",
          left: "79px",
          width: "232px",
          height: "253px",
          opacity: 0,
          transform: "scale(0.6) rotate(-12deg)",
          transformOrigin: "center",
        }}
      >
        <Image src="/images/onboarding/star-flower.svg" alt="" fill priority sizes="232px" />
      </div>

      {/* Headline: "Les Étoiles / du Guide" */}
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
          Les <span style={{ fontWeight: "var(--font-weight-bold)" }}>Étoiles</span>
        </span>
        <span
          data-anim="title-2"
          style={{
            display: "block",
            fontWeight: "var(--font-weight-regular)",
            opacity: 0,
            transform: "translateY(18px)",
          }}
        >
          du Guide
        </span>
      </p>

      {/* Body copy — 3 paragraphs, 4 wrapped lines */}
      <div
        data-anim="body"
        style={{
          position: "absolute",
          top: "583px",
          left: "16px",
          right: "16px",
          height: "88px",
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
        <p style={{ margin: 0 }}>Avec le temps, le Guide Michelin</p>
        <p style={{ margin: 0 }}>
          devient une référence, et dans les années 1920, nos inspecteurs anonymes commencent
        </p>
        <p style={{ margin: 0 }}>à décerner des étoiles aux meilleures tables.</p>
      </div>

      {/* Progress dashes — position 2 is active */}
      <ProgressDash left={67} />
      <ProgressDash left="calc(25% + 13.5px)" active />
      <ProgressDash left="calc(25% + 57.5px)" />
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
