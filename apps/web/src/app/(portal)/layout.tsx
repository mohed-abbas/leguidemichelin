import { FooterDisclaimer } from "@/components/footer-disclaimer";
import { PortalSidebar } from "@/components/portal-sidebar";
import { getServerSession } from "@/lib/get-server-session";
import type { ReactNode } from "react";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  // Hide the portal sidebar on /portal/login where the viewer is
  // unauthenticated. Proxy role-gate already blocks diners from portal
  // routes, so any non-staff session here means we're on the login screen.
  const showSidebar = session?.user.role === "RESTAURANT_STAFF";
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gridTemplateRows: "64px 1fr auto",
      }}
    >
      <header
        role="banner"
        style={{
          height: "64px",
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          paddingInline: "var(--space-xl)",
          fontWeight: "var(--font-weight-semibold)",
          zIndex: "var(--z-nav)",
        }}
      >
        Guide Foodie Journey — Portail
      </header>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showSidebar ? "240px 1fr" : "minmax(0, 1fr)",
        }}
      >
        {showSidebar ? (
          <aside
            style={{
              background: "var(--color-surface-muted)",
              borderRight: "1px solid var(--color-border)",
              minHeight: "100%",
            }}
            aria-label="Navigation latérale"
          >
            <PortalSidebar />
          </aside>
        ) : null}
        <main
          id="main"
          role="main"
          style={{
            padding: "var(--space-xl)",
          }}
        >
          {children}
          <FooterDisclaimer align="left" />
        </main>
      </div>
    </div>
  );
}
