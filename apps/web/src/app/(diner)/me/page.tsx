import { getServerSession } from "@/lib/get-server-session";
import { LogoutButton } from "@/components/logout-button";

export default async function MePage() {
  const session = await getServerSession();
  const name = session?.user.name ?? "";
  const email = session?.user.email ?? "";

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        padding: "var(--space-lg) 0",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Mon compte
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          padding: "var(--space-md)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{name}</span>
        <span
          style={{
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {email}
        </span>
      </div>
      <LogoutButton redirectTo="/login" />
    </section>
  );
}
