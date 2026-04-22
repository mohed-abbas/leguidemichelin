"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, Coins, User } from "lucide-react";

interface Tab {
  href: string;
  label: string;
  Icon: typeof Home;
  exact?: boolean;
}

const TABS: Tab[] = [
  { href: "/", label: "Accueil", Icon: Home, exact: true },
  { href: "/collection", label: "Collection", Icon: Images },
  { href: "/points", label: "Points", Icon: Coins },
  { href: "/me", label: "Moi", Icon: User },
];

function isActive(pathname: string, tab: Tab): boolean {
  if (tab.exact) return pathname === tab.href;
  return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

export function DinerBottomNav() {
  const pathname = usePathname();
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        height: "56px",
        alignItems: "stretch",
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab);
        return (
          <li key={tab.href} style={{ display: "flex" }}>
            <Link
              href={tab.href}
              aria-current={active ? "page" : undefined}
              style={{
                flex: 1,
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "var(--space-xs)",
                textDecoration: "none",
                color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
                fontSize: "var(--font-size-xs)",
                fontWeight: active ? "var(--font-weight-semibold)" : "var(--font-weight-regular)",
                borderTop: active ? "2px solid var(--color-accent)" : "2px solid transparent",
              }}
            >
              <tab.Icon size={20} aria-hidden />
              <span>{tab.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
