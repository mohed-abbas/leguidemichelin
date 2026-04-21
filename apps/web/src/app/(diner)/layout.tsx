import { FooterDisclaimer } from "@/components/footer-disclaimer";
import type { ReactNode } from "react";

export default function DinerLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
      }}
    >
      <header
        style={{
          paddingTop: "env(safe-area-inset-top)",
          minHeight: 0,
        }}
        aria-hidden
      />
      <main
        id="main"
        role="main"
        style={{
          flex: 1,
          paddingInline: "var(--space-md)",
          paddingBlock: "var(--space-lg)",
          maxWidth: "768px",
          width: "100%",
          marginInline: "auto",
        }}
      >
        {children}
        <FooterDisclaimer align="center" />
      </main>
      <nav
        aria-label="Primary"
        style={{
          height: "56px",
          background: "var(--color-surface-muted)",
          paddingBottom: "env(safe-area-inset-bottom)",
          zIndex: "var(--z-nav)",
        }}
      >
        {/* Phase 2 fills bottom-nav content */}
      </nav>
    </div>
  );
}
