"use client";

/**
 * AccountList — /me settings rows (Figma node 43:842 "Compte").
 *
 * 11 tappable rows, 54px tall, 16px horizontal inset, 0.5px hairline
 * dividers on every row (top border on the first row mirrors the Figma line
 * under the page title at y=157).
 *
 * Two rows are action buttons instead of links:
 *   • "Se déconnecter" → authClient.signOut + router.replace('/login')
 *   • "Vider le cache" → caches.keys() delete + unregister SW + reload
 *
 * Non-v1 destinations route to /soon (placeholder) rather than fabricating
 * routes; the Figma shows the rows as plain text so /soon keeps behaviour
 * discoverable without inventing product surface.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type Row =
  | { kind: "link"; label: string; href: string }
  | { kind: "logout"; label: string }
  | { kind: "clear-cache"; label: string };

const ROWS: readonly Row[] = [
  { kind: "link", label: "Votre compte", href: "/soon" },
  { kind: "link", label: "Chasseur d’étoiles", href: "/soon" },
  { kind: "link", label: "Informations générales", href: "/soon" },
  { kind: "link", label: "Newsletter", href: "/soon" },
  { kind: "link", label: "Programme Plus", href: "/soon" },
  { kind: "link", label: "Service client", href: "/soon" },
  { kind: "link", label: "Préférences", href: "/soon" },
  { kind: "link", label: "Commentaires", href: "/soon" },
  { kind: "link", label: "Conditions générales et confidentialité", href: "/soon" },
  { kind: "logout", label: "Se déconnecter" },
  { kind: "clear-cache", label: "Vider le cache" },
];

const rowBaseStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: 54,
  paddingInline: 16,
  fontFamily: "var(--font-sans)",
  fontWeight: "var(--font-weight-regular)",
  fontSize: 17,
  lineHeight: "normal",
  color: "var(--color-ink)",
  textDecoration: "none",
  background: "transparent",
  border: "none",
  borderTop: "0.5px solid var(--color-border)",
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
};

export function AccountList() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Impossible de se déconnecter, réessayez.");
      setSigningOut(false);
    }
  }

  async function handleClearCache() {
    if (clearing) return;
    setClearing(true);
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      toast.success("Cache vidé, rechargement…");
      setTimeout(() => window.location.reload(), 400);
    } catch {
      toast.error("Impossible de vider le cache.");
      setClearing(false);
    }
  }

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {ROWS.map((row, i) => (
        <li key={`${row.kind}-${i}`} style={{ display: "block" }}>
          {row.kind === "link" ? (
            <Link href={row.href} style={rowBaseStyle}>
              {row.label}
            </Link>
          ) : row.kind === "logout" ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{ ...rowBaseStyle, opacity: signingOut ? 0.6 : 1 }}
            >
              {signingOut ? "Déconnexion…" : row.label}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearCache}
              disabled={clearing}
              style={{ ...rowBaseStyle, opacity: clearing ? 0.6 : 1 }}
            >
              {clearing ? "Nettoyage…" : row.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
