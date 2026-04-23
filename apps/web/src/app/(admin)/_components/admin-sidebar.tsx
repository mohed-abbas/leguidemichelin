"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Users } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

interface Item {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
}

const ITEMS: Item[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/admin/restaurants", label: "Restaurants", Icon: Store },
  { href: "/admin/users", label: "Utilisateurs", Icon: Users },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigation latérale"
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
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-xs)",
                  padding: "var(--space-xs) var(--space-sm)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
                  background: active ? "var(--color-surface)" : "transparent",
                  fontWeight: active ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
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
        <LogoutButton redirectTo="/login" variant="outline">
          Se déconnecter
        </LogoutButton>
      </div>
    </nav>
  );
}
