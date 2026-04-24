import { getServerSession } from "@/lib/get-server-session";
import { serverApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { QrRenderer } from "./_components/qr-renderer";
import { QrPngDownload } from "./_components/qr-png-download";
import { QrCopyButton } from "./_components/qr-copy-button";
import type { PortalQrResponseType } from "@repo/shared-schemas";

export default async function PortalQrPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "RESTAURANT_STAFF") {
    redirect("/portal/login");
  }

  let qrData: PortalQrResponseType | null = null;
  try {
    qrData = await serverApi.get<PortalQrResponseType>("/portal/qr");
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
          maxWidth: "560px",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-size-h1)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
            lineHeight: "var(--line-height-xl)",
          }}
        >
          QR Code
        </h1>
        <p
          role="alert"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-lg)",
            color: "var(--color-destructive)",
            margin: 0,
          }}
        >
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
        gap: "var(--space-xl)",
        maxWidth: "720px",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--color-ink-muted)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Portail restaurateur
        </p>
        <h1
          style={{
            fontSize: "var(--font-size-h1)",
            fontWeight: "var(--font-weight-semibold)",
            lineHeight: "var(--line-height-xl)",
            margin: 0,
          }}
        >
          QR Code
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--color-ink-muted)",
            maxWidth: "560px",
          }}
        >
          Imprimez ce QR code et affichez-le en salle. Vos clients le scannent pour garder un
          souvenir de leur repas et gagner des points.
        </p>
      </header>

      <article
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-xl)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-lg)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          style={{
            padding: "var(--space-md)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <QrRenderer url={qrData.url} size={300} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-xs)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-ink-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Lien de scan
          </span>
          <code
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-ink)",
              wordBreak: "break-all",
              fontFamily: "var(--font-sans)",
            }}
          >
            {qrData.url}
          </code>
        </div>
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <QrPngDownload url={qrData.url} slug={qrData.restaurantSlug} />
          <QrCopyButton url={qrData.url} />
        </div>
      </article>

      <aside
        style={{
          background: "var(--color-surface-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          Conseils d&apos;affichage
        </h2>
        <ul
          style={{
            margin: 0,
            paddingInlineStart: "var(--space-lg)",
            color: "var(--color-ink-muted)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-xs)",
            fontSize: "var(--font-size-sm)",
            lineHeight: "var(--line-height-sm)",
          }}
        >
          <li>Imprimez en 6×6 cm minimum pour une lecture fiable.</li>
          <li>Placez le QR sur chaque table ou sur l&apos;addition.</li>
          <li>Privilégiez un fond blanc mat ; évitez les reflets sur plastique.</li>
          <li>Si l&apos;impression échoue, partagez le lien ci-dessus à la place.</li>
        </ul>
      </aside>
    </section>
  );
}
