import { DinerBottomNav } from "@/components/diner-bottom-nav";
import { FooterDisclaimer } from "@/components/footer-disclaimer";
import { getServerSession } from "@/lib/get-server-session";
import type { ReactNode } from "react";

export default async function DinerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  // Hide the diner bottom nav on public gateways (/login, /signup) where
  // the viewer is unauthenticated — the proxy role gate redirects logged-in
  // staff away from diner routes, so the only time there's no session here
  // is on the public login/signup screens.
  const showNav = session?.user.role === "DINER";
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
      {showNav ? (
        <nav
          aria-label="Primary"
          style={{
            height: "56px",
            background: "var(--color-surface-muted)",
            paddingBottom: "env(safe-area-inset-bottom)",
            zIndex: "var(--z-nav)",
          }}
        >
          <DinerBottomNav />
        </nav>
      ) : null}
    </div>
  );
}
