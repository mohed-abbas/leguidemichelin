"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Onboarding 5/6 — "Partage ton avis pour remporter des récompenses"
 * (Figma node 53:1037). A phone mockup shows the in-app review flow; a
 * bottom-up red gradient fades the mockup into the copy below so the
 * hero and the headline read as one continuous surface.
 */
export function StepFive() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-anim]", { opacity: 1, scale: 1, y: 0 });
        gsap.set("[data-anim='dash-active']", { scaleX: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        "[data-anim='phone']",
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out" },
        0.1,
      )
        .to("[data-anim='fade']", { opacity: 1, duration: 0.6 }, 0.4)
        .to("[data-anim='title-1']", { opacity: 1, y: 0, duration: 0.55 }, 0.75)
        .to(
          "[data-anim='title-2']",
          {
            opacity: 1,
            scale: 1,
            duration: 0.55,
            ease: "back.out(2)",
          },
          0.95,
        )
        .to("[data-anim='body']", { opacity: 1, y: 0, duration: 0.55 }, 1.4)
        .to("[data-anim='dash']", { opacity: 0.35, duration: 0.4, stagger: 0.05 }, 1.75)
        .to(
          "[data-anim='dash-active']",
          { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.inOut" },
          2.15,
        )
        .to("[data-anim='skip']", { opacity: 1, duration: 0.4 }, 2.3);
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
    gsap.to(rootRef.current!.querySelectorAll("[data-anim]"), {
      opacity: 0,
      y: -16,
      duration: 0.3,
      stagger: 0.02,
      ease: "power2.in",
      onComplete: () => router.push(href),
    });
  };

  const handleNext = () => advanceTo("/onboarding/6");
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
      {/* Phone mockup — hero */}
      <div
        data-anim="phone"
        style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          width: "311px",
          height: "627px",
          transform: "translateX(-50%) translateY(18px) scale(0.97)",
          transformOrigin: "center bottom",
          opacity: 0,
        }}
      >
        <Image
          src="/images/onboarding/phone-review.png"
          alt=""
          fill
          priority
          sizes="311px"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Bottom-up red gradient — fades the lower phone into the background so
          the headline reads over a clean surface. (Figma: from rgba(186,11,47,0)
          at 0% → #ba0b2f at 17%, stays solid red to 100%.) */}
      <div
        data-anim="fade"
        aria-hidden
        style={{
          position: "absolute",
          top: "378px",
          left: "-16px",
          width: "415px",
          height: "553px",
          background:
            "linear-gradient(to bottom, rgba(186, 11, 47, 0) 0%, var(--color-primary) 17%)",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Headline — "Partage ton avis pour remporter des récompenses." The
          Figma frame anchors the 80px box by its bottom edge (top 566,
          translateY −100%); overflow extends upward to fit the 3-line content. */}
      <div
        style={{
          position: "absolute",
          top: "566px",
          left: "50%",
          transform: "translate(-50%, -100%)",
          width: "286px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          fontFamily: "var(--font-sans)",
          fontSize: "34px",
          lineHeight: "normal",
          color: "var(--color-primary-fg)",
          textAlign: "center",
          fontVariationSettings: "'wdth' 100",
        }}
      >
        <p style={{ margin: 0 }}>
          <span
            data-anim="title-1"
            style={{
              display: "inline",
              fontWeight: "var(--font-weight-regular)",
              opacity: 0,
            }}
          >
            Partage ton avis pour{" "}
          </span>
          <span
            data-anim="title-2"
            style={{
              display: "inline-block",
              fontWeight: "var(--font-weight-bold)",
              opacity: 0,
              transform: "scale(0.7)",
              transformOrigin: "center",
            }}
          >
            remporter des récompenses.
          </span>
        </p>
      </div>

      {/* Body copy */}
      <div
        data-anim="body"
        style={{
          position: "absolute",
          top: "609px",
          left: "16px",
          right: "16px",
          transform: "translateY(0)",
          height: "86px",
          opacity: 0,
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "13px",
          lineHeight: "17px",
          color: "var(--color-primary-fg)",
          textAlign: "center",
          fontVariationSettings: "'wdth' 100",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p style={{ margin: 0 }}>Votre opinion façonne l’excellence.</p>
        <p style={{ margin: 0 }}>
          Évaluez vos expériences et gagnez des avantages exclusifs au sein de notre communauté
          gastronomique.
        </p>
      </div>

      {/* Progress dashes — position 5 is active */}
      <ProgressDash left={67} />
      <ProgressDash left="calc(25% + 13.5px)" />
      <ProgressDash left="calc(25% + 57.5px)" />
      <ProgressDash left="calc(50% + 4px)" />
      <ProgressDash left="calc(50% + 48px)" active />
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
