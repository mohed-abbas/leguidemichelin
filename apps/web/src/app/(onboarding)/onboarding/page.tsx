"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Onboarding splash — "Transition" (Figma node 0:750).
 *
 * Lands after login. The wordmark and caption fade in, the mascot walks up,
 * and after a ~2.5s dwell the whole surface fades out and the router advances
 * to the narrative intro at /onboarding/1. The red background is shared with
 * the next page so the handoff is perceptually seamless.
 */
export default function OnboardingTransitionPage() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set("[data-anim]", { opacity: 1, y: 0 });
        const t = window.setTimeout(() => router.push("/onboarding/1"), 1200);
        return () => window.clearTimeout(t);
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-anim='wordmark']", { opacity: 1, y: 0, duration: 0.9 }, 0.1)
        .to("[data-anim='caption']", { opacity: 1, y: 0, duration: 0.6 }, 0.7)
        .to("[data-anim='mascot']", { opacity: 1, y: 0, duration: 0.8 }, 1.0)
        .to({}, { duration: 1.2 })
        .to(["[data-anim='wordmark']", "[data-anim='caption']", "[data-anim='mascot']"], {
          opacity: 0,
          y: -12,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.in",
          onComplete: () => router.push("/onboarding/1"),
        });
    }, rootRef);

    return () => ctx.revert();
  }, [router]);

  return (
    <div
      ref={rootRef}
      data-onboarding-surface
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
      <div
        data-anim="wordmark"
        style={{
          position: "absolute",
          top: "256px",
          left: "16px",
          width: "357px",
          height: "187px",
          opacity: 0,
          transform: "translateY(12px)",
        }}
      >
        <Image
          src="/images/onboarding/wordmark-michelin-guide.png"
          alt="MICHELIN GUIDE"
          fill
          priority
          sizes="357px"
          style={{ objectFit: "contain" }}
        />
      </div>

      <p
        data-anim="caption"
        style={{
          margin: 0,
          position: "absolute",
          top: "399px",
          left: "50%",
          width: "294px",
          transform: "translate(-50%, 8px)",
          opacity: 0,
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-semibold)",
          fontSize: "var(--font-size-sm)",
          lineHeight: "17px",
          color: "var(--color-primary-fg)",
          textAlign: "center",
          fontVariationSettings: "'wdth' 100",
        }}
      >
        Nous préparons le guide pour toi...
      </p>

      <div
        data-anim="mascot"
        aria-hidden
        style={{
          position: "absolute",
          top: "675px",
          left: "169px",
          width: "63px",
          height: "86px",
          overflow: "hidden",
          pointerEvents: "none",
          opacity: 0,
          transform: "translateY(16px)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "619.05%",
            height: "981.4%",
            left: "-260.32%",
            top: "-786.05%",
          }}
        >
          <Image
            src="/images/onboarding/bibendum-mascot.png"
            alt=""
            fill
            priority
            sizes="390px"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}
