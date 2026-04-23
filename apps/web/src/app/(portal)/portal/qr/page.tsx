import { getServerSession } from "@/lib/get-server-session";
import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { QrRenderer } from "./_components/qr-renderer";
import { QrPngDownload } from "./_components/qr-png-download";
import type { PortalQrResponseType } from "@repo/shared-schemas";

export default async function PortalQrPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "RESTAURANT_STAFF") {
    redirect("/portal/login");
  }

  let qrData: PortalQrResponseType | null = null;
  try {
    qrData = await api.get<PortalQrResponseType>("/portal/qr");
  } catch {
    // handled below
  }

  if (!qrData) {
    return (
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          maxWidth: "500px",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          QR Code
        </h1>
        <p style={{ color: "var(--color-destructive)", margin: 0 }}>
          Impossible de charger le QR code. Réessayez plus tard.
        </p>
      </section>
    );
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        maxWidth: "500px",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        QR Code
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-md)",
          padding: "var(--space-xl)",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <QrRenderer url={qrData.url} size={300} />
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--color-ink-muted)",
            wordBreak: "break-all",
            textAlign: "center",
          }}
        >
          {qrData.url}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--color-ink-muted)",
            textAlign: "center",
          }}
        >
          Si l&apos;impression échoue, imprimez l&apos;URL en caractères lisibles.
        </p>
      </div>

      <QrPngDownload url={qrData.url} slug={qrData.restaurantSlug} />
    </section>
  );
}
