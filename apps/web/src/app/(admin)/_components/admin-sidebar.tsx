"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, LayoutDashboard, Store, Users } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

interface Item {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
}

interface Group {
  label: string;
  items: Item[];
}

const GROUPS: Group[] = [
  {
    label: "Vue d'ensemble",
    items: [{ href: "/admin/dashboard", label: "Tableau de bord", Icon: LayoutDashboard }],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/restaurants", label: "Restaurants", Icon: Store },
      { href: "/admin/rewards", label: "Récompenses", Icon: Gift },
    ],
  },
  {
    label: "Communauté",
    items: [{ href: "/admin/users", label: "Utilisateurs", Icon: Users }],
  },
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
        height: "100%",
        padding: "var(--space-lg) var(--space-md) var(--space-md)",
        gap: "var(--space-lg)",
      }}
    >
      <Link
        href="/admin/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "var(--space-xs) var(--space-sm)",
          textDecoration: "none",
          color: "var(--color-ink)",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary)",
            color: "var(--color-primary-fg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "0.04em",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          GFJ
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
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-ink)",
            }}
          >
            Guide Foodie
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "var(--color-ink-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Console
          </span>
        </span>
      </Link>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {GROUPS.map((group) => (
          <div
            key={group.label}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "var(--color-ink-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: "var(--font-weight-semibold)",
                padding: "0 var(--space-sm)",
              }}
            >
              {group.label}
            </span>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-sm)",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-md)",
                        textDecoration: "none",
                        fontSize: "var(--font-size-sm)",
                        color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
                        background: active ? "var(--color-surface)" : "transparent",
                        fontWeight: active
                          ? "var(--font-weight-semibold)"
                          : "var(--font-weight-medium)",
                        boxShadow: active ? "var(--shadow-sm)" : "none",
                        transition: "background var(--duration-fast) var(--ease-standard)",
                      }}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: -2,
                            top: 6,
                            bottom: 6,
                            width: 3,
                            borderRadius: 2,
                            background: "var(--color-primary)",
                          }}
                        />
                      ) : null}
                      <item.Icon
                        size={16}
                        aria-hidden
                        style={{
                          color: active ? "var(--color-primary)" : "var(--color-ink-subtle)",
                          flex: "0 0 auto",
                        }}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ paddingTop: "var(--space-md)", borderTop: "1px solid var(--color-border)" }}>
        <LogoutButton redirectTo="/login" variant="outline">
          Se déconnecter
        </LogoutButton>
      </div>
    </nav>
  );
}
