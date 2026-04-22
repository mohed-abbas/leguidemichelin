import { getServerSession } from "@/lib/get-server-session";

export default async function DinerHomePage() {
  // Proxy gates this route: anonymous viewers are redirected to /login,
  // staff to /portal/menu. Only an authenticated diner can reach here.
  const session = await getServerSession();
  const name = session?.user.name ?? "";
  const greeting = `Bonjour ${name} !`;
  const subCopy = "Scannez un QR restaurant pour créer votre premier souvenir.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        padding: "var(--space-xl) var(--space-md)",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        margin: "var(--space-xl) 0",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "var(--line-height-xl)",
          textAlign: "center",
          margin: 0,
        }}
      >
        {greeting}
      </h1>
      <p
        style={{
          fontSize: "var(--font-size-base)",
          color: "var(--color-ink-muted)",
          textAlign: "center",
          margin: 0,
        }}
      >
        {subCopy}
      </p>
    </div>
  );
}
