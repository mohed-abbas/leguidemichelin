"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { ServerSessionUser } from "@/lib/get-server-session";

const SEGMENT_LABEL: Record<string, string> = {
  admin: "Administration",
  dashboard: "Tableau de bord",
  restaurants: "Restaurants",
  users: "Utilisateurs",
  rewards: "Récompenses",
};

const ROLE_LABEL: Record<ServerSessionUser["role"], string> = {
  ADMIN: "Admin",
  DINER: "Dîneur",
  RESTAURANT_STAFF: "Staff",
};

function initials(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

interface Props {
  user: ServerSessionUser;
}

export function AdminHeader({ user }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header
      role="banner"
      style={{
        height: 64,
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-lg)",
        paddingInline: "var(--space-xl)",
        zIndex: "var(--z-nav)",
      }}
    >
      <nav
        aria-label="Fil d'Ariane"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-sm)",
          minWidth: 0,
          flex: 1,
        }}
      >
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          const label = SEGMENT_LABEL[seg] ?? seg;
          return (
            <span
              key={`${seg}-${i}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: isLast ? "var(--color-ink)" : "var(--color-ink-muted)",
                fontWeight: isLast ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {label}
              {isLast ? null : (
                <ChevronRight size={14} aria-hidden style={{ color: "var(--color-ink-subtle)" }} />
              )}
            </span>
          );
        })}
      </nav>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "4px 10px 4px 4px",
          borderRadius: "var(--radius-full)",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
        }}
        title={`${user.name} • ${user.email}`}
      >
        <span
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-full)",
            background: "var(--color-primary)",
            color: "var(--color-primary-fg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "0.04em",
          }}
        >
          {initials(user.name, user.email)}
        </span>
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.15,
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-ink)",
              maxWidth: 160,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.name || user.email.split("@")[0]}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "var(--color-ink-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {ROLE_LABEL[user.role]}
          </span>
        </span>
      </div>
    </header>
  );
}
