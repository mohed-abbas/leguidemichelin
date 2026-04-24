"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Onboarding 6/6 — "Et construis ta collection." (Figma node 54:1061).
 *
 * The finale. Phone mockup of the souvenirs surface, a two-line headline, body
 * copy, and the primary CTA "C'est parti pour la chasse !" that leaves the
 * onboarding for the diner home. No progress dashes (done state). Whole-screen
 * tap-to-advance is off here because the CTA is the explicit action.
 */
export function StepSix() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-anim]", { opacity: 1, scale: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        "[data-anim='phone']",
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out" },
        0.1,
      )
        .to("[data-anim='fade']", { opacity: 1, duration: 0.6 }, 0.4)
        .to("[data-anim='title-1']", { opacity: 1, y: 0, duration: 0.55 }, 0.8)
        .to(
          "[data-anim='title-2']",
          {
            opacity: 1,
            scale: 1,
            duration: 0.55,
            ease: "back.out(2)",
          },
          1.0,
        )
        .to("[data-anim='body']", { opacity: 1, y: 0, duration: 0.55 }, 1.4)
        .to("[data-anim='cta']", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 1.7)
        .to("[data-anim='skip']", { opacity: 1, duration: 0.4 }, 2.0);
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

  const handleStart = () => advanceTo("/");
  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    advanceTo("/");
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "390px",
        marginInline: "auto",
        minHeight: "100dvh",
        background: "var(--color-primary)",
        overflow: "hidden",
      }}
    >
      {/* Phone mockup — collection surface */}
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
          src="/images/onboarding/phone-collection.png"
          alt=""
          fill
          priority
          sizes="311px"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Red gradient fade — same pattern as step 5, just higher up because
          this screen has a CTA button instead of long body copy. */}
      <div
        data-anim="fade"
        aria-hidden
        style={{
          position: "absolute",
          top: "424px",
          left: "-16px",
          width: "415px",
          height: "507px",
          background:
            "linear-gradient(to bottom, rgba(186, 11, 47, 0) 0%, var(--color-primary) 17%)",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      {/* Headline — "Et construis / ta collection." */}
      <div
        style={{
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
        <p
          data-anim="title-1"
          style={{
            margin: 0,
            fontWeight: "var(--font-weight-regular)",
            opacity: 0,
            transform: "translateY(18px)",
          }}
        >
          Et construis
        </p>
        <p
          data-anim="title-2"
          style={{
            margin: 0,
            fontWeight: "var(--font-weight-bold)",
            opacity: 0,
            transform: "scale(0.7)",
            transformOrigin: "center",
          }}
        >
          ta collection.
        </p>
      </div>

      {/* Body copy — 16px (back to the larger size of screens 1 and 2) */}
      <p
        data-anim="body"
        style={{
          margin: 0,
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
        Prenez une photo de votre plat et retrouvez-la facilement dans votre espace personnel.
      </p>

      {/* Primary CTA — same pill shape + shadow as the login chooser buttons */}
      <button
        type="button"
        data-anim="cta"
        onClick={handleStart}
        aria-label="C’est parti pour la chasse"
        style={{
          position: "absolute",
          top: "706px",
          left: "50%",
          transform: "translateX(-50%) translateY(18px)",
          width: "294px",
          height: "54px",
          background: "var(--color-surface)",
          border: "none",
          borderRadius: "25px",
          boxShadow: "0 4px 19px 0 rgba(0, 0, 0, 0.03)",
          cursor: "pointer",
          padding: 0,
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "16px",
          lineHeight: "17px",
          color: "var(--color-ink)",
          opacity: 0,
          fontVariationSettings: "'wdth' 100",
        }}
      >
        C’est parti pour la chasse !
      </button>

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
