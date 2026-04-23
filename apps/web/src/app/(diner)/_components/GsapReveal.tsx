"use client";

/**
 * GsapReveal — GSAP timeline wrapper for the souvenir reveal animation.
 *
 * The timeline fires ONLY after `imageLoaded` flips to true — gating the
 * animation on the <img> onLoad event prevents a reveal from running on a
 * broken or not-yet-loaded image (04-04-PLAN.md must_haves.truths #2).
 *
 * Timeline total duration: 1.80s (<= the 2s cap in D-10):
 *   card flip  0.45s  (power2.out)
 *   blur-sharp 0.75s  (power1.out, overlap -0.1s)
 *   pts tween  0.80s  (expo.out,   overlap -0.3s)
 *   cta fade   0.25s  (linear,     sequential)
 *
 * `dependencies: [imageLoaded]` in useGSAP makes the timeline re-run on
 * every imageLoaded flip, which naturally replays on back-navigation because
 * Next 16 remounts the component on each navigation and imageLoaded starts
 * as false until the img fires its native onLoad.
 *
 * Canonical refs:
 *   - 04-04-PLAN.md task 2
 *   - 04-RESEARCH.md §3 (GSAP + useGSAP timeline)
 *   - 04-CONTEXT.md D-10 (total reveal duration <= 2s, replay requirement)
 */

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface GsapRevealProps {
  oldBalance: number;
  newBalance: number;
  imageLoaded: boolean;
  children: React.ReactNode;
}

export function GsapReveal({ oldBalance, newBalance, imageLoaded, children }: GsapRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!imageLoaded) return;
      const tl = gsap.timeline();
      tl.from(".reveal-card", { rotationY: 90, scale: 0.85, duration: 0.45, ease: "power2.out" })
        .from(
          ".reveal-photo",
          { filter: "blur(20px)", opacity: 0, duration: 0.75, ease: "power1.out" },
          "-=0.1",
        )
        .fromTo(
          ".reveal-points",
          { innerText: oldBalance },
          {
            innerText: newBalance,
            duration: 0.8,
            ease: "expo.out",
            snap: { innerText: 1 },
            modifiers: {
              innerText: (v: string) => Math.round(Number(v)).toLocaleString("fr-FR"),
            },
          },
          "-=0.3",
        )
        .from(".reveal-ctas", { opacity: 0, y: 10, duration: 0.25 });
    },
    { scope, dependencies: [imageLoaded] },
  );

  return <div ref={scope}>{children}</div>;
}
