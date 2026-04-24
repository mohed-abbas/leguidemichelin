import { Caveat } from "next/font/google";
import type { ReactNode } from "react";

/**
 * Caveat — free Google Font substitute for Figma_Hand (the handwritten caption
 * under the André & Édouard photo). Scoped to the onboarding group so it
 * doesn't bloat the rest of the app's font budget.
 */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-handwriting",
  display: "swap",
});

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main
      id="main"
      role="main"
      className={caveat.variable}
      style={{
        minHeight: "100dvh",
        background: "var(--color-primary)",
      }}
    >
      {children}
    </main>
  );
}
