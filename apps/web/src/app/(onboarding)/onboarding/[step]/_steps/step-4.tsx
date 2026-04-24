"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Onboarding 4/6 — "Valide tes visites" (Figma node 0:797).
 *
 * A receipt-photo frame with two red viewfinder corner brackets. Teaches the
 * diner to photograph their ticket to validate a visit.
 */
const AUTO_ADVANCE_MS = 5000;

export function StepFour() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const autoTimer = window.setTimeout(() => {
      if (!leavingRef.current) advanceTo("/onboarding/5");
    }, AUTO_ADVANCE_MS);

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-anim]", { opacity: 1, scale: 1, y: 0 });
        gsap.set("[data-anim='dash-active']", { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        "[data-anim='frame']",
        { opacity: 1, scale: 1, duration: 0.75, ease: "power2.out" },
        0.1,
      )
        .to(
          "[data-anim='corner-tl']",
          { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
          0.55,
        )
        .to(
          "[data-anim='corner-br']",
          { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
          0.7,
        )
        .to(
          "[data-anim='title-bold']",
          {
            opacity: 1,
            scale: 1,
            duration: 0.55,
            ease: "back.out(2)",
          },
          0.95,
        )
        .to("[data-anim='title-rest']", { opacity: 1, x: 0, duration: 0.5 }, 1.15)
        .to("[data-anim='body']", { opacity: 1, y: 0, duration: 0.55 }, 1.5)
        .to("[data-anim='dash']", { opacity: 0.35, duration: 0.4, stagger: 0.05 }, 1.85)
        .to(
          "[data-anim='dash-active']",
          { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.inOut" },
          2.2,
        )
        .to("[data-anim='skip']", { opacity: 1, duration: 0.4 }, 2.35);
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

  const handleNext = () => advanceTo("/onboarding/5");
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
      {/* Grey photo frame / mat */}
      <div
        data-anim="frame"
        style={{
          position: "absolute",
          top: "78px",
          left: "38px",
          width: "314px",
          height: "392px",
          background: "var(--color-photo-mat)",
          opacity: 0,
          transform: "scale(0.95)",
          transformOrigin: "center center",
        }}
      >
        {/* Receipt photo — Figma crops the 1086×1448 source to a 286×368 window
            with a slight zoom (109.79% × 113.77%) and tiny offset (-4.9%, -6.75%). */}
        <div
          style={{
            position: "absolute",
            top: "12px" /* 90 − 78 */,
            left: "14px" /* 52 − 38 */,
            width: "286px",
            height: "368px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "109.79%",
              height: "113.77%",
              left: "-4.9%",
              top: "-6.75%",
            }}
          >
            <Image
              src="/images/onboarding/receipt.png"
              alt=""
              fill
              priority
              sizes="286px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>

      {/* Viewfinder corner — top-left */}
      <CornerBracket
        side="tl"
        left="calc(25% + 29.5px)"
        top="109px"
        width="16.353px"
        height="18.645px"
        rotate="-4.59deg"
      />
      {/* Viewfinder corner — bottom-right */}
      <CornerBracket
        side="br"
        left="calc(75% + 1.5px)"
        top="387px"
        width="18.296px"
        height="20.224px"
        rotate="168.06deg"
      />

      {/* Headline: "Valide tes visites" */}
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
          Valide
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
          &nbsp;tes visites
        </span>
      </div>

      {/* Body copy */}
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
        Prends en photo ton ticket de caisse après ton repas pour confirmer ta présence et
        collectionner tes récompenses.
      </p>

      {/* Progress dashes — position 4 is active */}
      <ProgressDash left={67} />
      <ProgressDash left="calc(25% + 13.5px)" />
      <ProgressDash left="calc(25% + 57.5px)" />
      <ProgressDash left="calc(50% + 4px)" active />
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

function CornerBracket({
  side,
  left,
  top,
  width,
  height,
  rotate,
}: {
  side: "tl" | "br";
  left: string;
  top: string;
  width: string;
  height: string;
  rotate: string;
}) {
  return (
    <div
      data-anim={`corner-${side}`}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0,
        transform: "scale(0.4)",
        transformOrigin: "center",
      }}
    >
      <div
        style={{
          transform: `rotate(${rotate})`,
          width: "15px",
          height: "17.5px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: "-11.43% -13.33%" }}>
          <img
            src="/images/onboarding/corner-bracket.svg"
            alt=""
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
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
