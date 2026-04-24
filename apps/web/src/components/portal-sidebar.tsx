"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, QrCode } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

interface Item {
  href: string;
  label: string;
  Icon: typeof UtensilsCrossed;
  exact?: boolean;
}

const ITEMS: Item[] = [
  { href: "/portal", label: "Tableau de bord", Icon: LayoutDashboard, exact: true },
  { href: "/portal/menu", label: "Menu", Icon: UtensilsCrossed },
  { href: "/portal/qr", label: "QR Code", Icon: QrCode },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalSidebar() {
  const pathname = usePathname();
  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        padding: "var(--space-md)",
        height: "100%",
      }}
    >
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
        }}
      >
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
                  background: active ? "var(--color-surface)" : "transparent",
                  border: active ? "1px solid var(--color-border)" : "1px solid transparent",
                  fontWeight: active ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                  fontSize: "var(--font-size-sm)",
                  transition: "background var(--duration-fast) var(--ease-standard)",
                }}
              >
                <item.Icon size={18} aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: "auto", paddingTop: "var(--space-md)" }}>
        <LogoutButton redirectTo="/portal/login" variant="outline">
          Se déconnecter
        </LogoutButton>
      </div>
    </nav>
  );
}
