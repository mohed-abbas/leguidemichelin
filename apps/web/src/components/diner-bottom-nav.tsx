"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TabKey = "restaurants" | "hotels" | "favorites" | "profile";

interface Tab {
  key: TabKey;
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}

const TABS: Tab[] = [
  {
    key: "restaurants",
    href: "/",
    label: "Restaurants",
    isActive: (p) => p === "/" || p.startsWith("/restaurants") || p.startsWith("/scan"),
  },
  {
    key: "hotels",
    href: "/hotels",
    label: "Hôtels",
    isActive: (p) => p.startsWith("/hotels"),
  },
  {
    key: "favorites",
    href: "/collection",
    label: "Favoris",
    isActive: (p) => p.startsWith("/collection") || p.startsWith("/souvenirs"),
  },
  {
    key: "profile",
    href: "/me",
    label: "Profil",
    isActive: (p) => p.startsWith("/me") || p.startsWith("/points"),
  },
];

function RestaurantsIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="36" height="27" viewBox="0 0 36 27" fill="none" aria-hidden>
      <path
        d="M17.5973 25.6C24.5009 25.6 30.0973 20.0035 30.0973 13.1C30.0973 6.19642 24.5009 0.599976 17.5973 0.599976C10.6937 0.599976 5.09729 6.19642 5.09729 13.1C5.09729 20.0035 10.6937 25.6 17.5973 25.6Z"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5973 20.8726C13.3116 20.8726 9.82745 17.3858 9.82745 13.1027C9.82745 8.81966 13.3142 5.33289 17.5973 5.33289C21.8804 5.33289 25.3671 8.81966 25.3671 13.1027C25.3671 17.3858 21.8804 20.8726 17.5973 20.8726Z"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5973 6.89893C19.4227 6.89893 21.0523 7.74813 22.1158 9.07088"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.1714 3.98096V6.91482C4.1714 7.8963 3.36717 8.70053 2.38569 8.70053C1.40421 8.70053 0.599976 7.8963 0.599976 6.91482V3.98096"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.689941 6.94385H4.0947"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.3645 6.89895V3.98096"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.31958 8.79578V22.4519"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32.7362 22.6V3.59998C32.7362 3.59998 33.4355 5.46799 34.1469 8.65571C34.4076 9.8249 34.5879 10.892 34.7122 11.7762C34.8998 13.1148 33.9642 14.3189 32.7362 14.3189"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HotelsIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="32" height="27" viewBox="0 0 32 27" fill="none" aria-hidden>
      <path
        d="M1.16815 21.6227V25.1C1.16815 25.3761 1.39201 25.6 1.66815 25.6H1.87087C2.11969 25.6 2.33065 25.417 2.36584 25.1707L2.8727 21.6227"
        stroke={stroke}
        strokeWidth="1.2"
      />
      <path
        d="M29.5773 21.6227V25.1C29.5773 25.3761 29.3534 25.6 29.0773 25.6H28.8746C28.6257 25.6 28.4148 25.417 28.3796 25.1707L27.8727 21.6227"
        stroke={stroke}
        strokeWidth="1.2"
      />
      <path d="M1.16815 15.9409H30.7136" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M1.73633 11.9636V1.09998C1.73633 0.823833 1.96019 0.599976 2.23633 0.599976H28.5091C28.7852 0.599976 29.0091 0.823833 29.0091 1.09998V11.9636"
        stroke={stroke}
        strokeWidth="1.2"
      />
      <path
        d="M3.44088 11.9637H1.09998C0.823833 11.9637 0.599976 12.1875 0.599976 12.4637V21.1228C0.599976 21.3989 0.823833 21.6228 1.09998 21.6228H30.2136C30.4898 21.6228 30.7136 21.3989 30.7136 21.1228V12.4637C30.7136 12.1875 30.4898 11.9637 30.2136 11.9637H13.6682M3.44088 11.9637V7.91821C3.44088 7.64207 3.66474 7.41821 3.94088 7.41821H13.1682C13.4443 7.41821 13.6682 7.64207 13.6682 7.91821V11.9637M3.44088 11.9637H13.6682M26.8045 7.41821H17.5772C17.3011 7.41821 17.0772 7.64207 17.0772 7.91821V11.4637C17.0772 11.7398 17.3011 11.9637 17.5772 11.9637H26.8045C27.0807 11.9637 27.3045 11.7398 27.3045 11.4637V7.91821C27.3045 7.64207 27.0807 7.41821 26.8045 7.41821Z"
        stroke={stroke}
        strokeWidth="1.2"
      />
    </svg>
  );
}

function FavoritesIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="31" height="29" viewBox="0 0 31 29" fill="none" aria-hidden>
      <path
        d="M15.5 25.9791C15.5 25.9791 2.38464 17.5208 2.38464 9.06247C2.38889 7.50672 2.88683 5.99362 3.80489 4.74674C4.72295 3.49985 6.01244 2.58532 7.48282 2.13828C8.9532 1.69124 10.5265 1.73539 11.9702 2.26422C13.4139 2.79305 14.6515 3.7785 15.5 5.07497C16.3486 3.7785 17.5862 2.79305 19.0299 2.26422C20.4736 1.73539 22.0469 1.69124 23.5172 2.13828C24.9876 2.58532 26.2771 3.49985 27.1952 4.74674C28.1132 5.99362 28.6112 7.50672 28.6154 9.06247C28.6154 17.5208 15.5 25.9791 15.5 25.9791Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ stroke }: { stroke: string }) {
  return (
    <svg width="27" height="29" viewBox="0 0 27 29" fill="none" aria-hidden>
      <path
        d="M13.5 15.0577C16.9173 15.0577 19.6875 12.3111 19.6875 8.92307C19.6875 5.53501 16.9173 2.78845 13.5 2.78845C10.0827 2.78845 7.3125 5.53501 7.3125 8.92307C7.3125 12.3111 10.0827 15.0577 13.5 15.0577Z"
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M1.125 26.7692C1.125 20.0769 6.75 15.6154 13.5 15.6154C20.25 15.6154 25.875 20.0769 25.875 26.7692"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
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
        height: "85px",
        alignItems: "center",
      }}
    >
      {TABS.map((tab) => {
        const active = tab.isActive(pathname);
        const stroke = active ? "var(--color-primary)" : "var(--color-ink-muted)";
        return (
          <li key={tab.key} style={{ display: "flex", justifyContent: "center" }}>
            <Link
              href={tab.href}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "var(--touch-target-min)",
                height: "var(--touch-target-min)",
                textDecoration: "none",
              }}
            >
              {tab.key === "restaurants" ? (
                <RestaurantsIcon stroke={stroke} />
              ) : tab.key === "hotels" ? (
                <HotelsIcon stroke={stroke} />
              ) : tab.key === "favorites" ? (
                <FavoritesIcon stroke={stroke} />
              ) : (
                <ProfileIcon stroke={stroke} />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
