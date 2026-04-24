import { DinerNavShell } from "@/components/diner-nav-shell";
import { FooterDisclaimer } from "@/components/footer-disclaimer";
import { getServerSession } from "@/lib/get-server-session";
import type { ReactNode } from "react";
import { FavoritesHydrator } from "./_components/FavoritesHydrator";

export default async function DinerLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
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
          width: "100%",
          maxWidth: "768px",
          marginInline: "auto",
          paddingBottom: showNav ? "calc(85px + env(safe-area-inset-bottom))" : undefined,
        }}
      >
        {children}
        <FooterDisclaimer align="center" />
      </main>
      {showNav ? <DinerNavShell /> : null}
      {showNav ? <FavoritesHydrator hasSession /> : null}
    </div>
  );
}
