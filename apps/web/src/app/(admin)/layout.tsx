import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { FooterDisclaimer } from "@/components/footer-disclaimer";
import { getServerSession } from "@/lib/get-server-session";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        display: "grid",
        gridTemplateRows: "64px 1fr",
        gridTemplateColumns: "260px 1fr",
        gridTemplateAreas: `"sidebar header" "sidebar main"`,
      }}
    >
      <aside
        aria-label="Navigation latérale"
        style={{
          gridArea: "sidebar",
          background: "var(--color-surface-muted)",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <AdminSidebar />
      </aside>

      <div style={{ gridArea: "header" }}>
        <AdminHeader user={session.user} />
      </div>

      <main
        id="main"
        style={{
          gridArea: "main",
          padding: "var(--space-xl)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xl)",
          maxWidth: 1320,
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)", flex: 1 }}>
          {children}
        </div>
        <FooterDisclaimer align="left" />
      </main>
    </div>
  );
}
