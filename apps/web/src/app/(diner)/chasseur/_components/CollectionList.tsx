import Link from "next/link";

import type { CollectionItem } from "../_data";
import { CollectionCard } from "./CollectionCard";

export function CollectionList({ items }: { items: CollectionItem[] }) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        paddingInline: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-placeholder)",
          lineHeight: "16.2px",
        }}
      >
        Collection d’étoiles
      </h2>
      {items.length === 0 ? (
        <EmptyCollection />
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {items.map((item) => (
            <li key={item.id}>
              <CollectionCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyCollection() {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 11,
        boxShadow: "0 0 9px 0 rgba(0, 0, 0, 0.07)",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          color: "var(--color-ink)",
          lineHeight: 1.4,
        }}
      >
        Aucun souvenir pour l’instant.
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--color-ink-muted)",
          lineHeight: "17px",
        }}
      >
        Scannez un QR code en restaurant pour commencer votre collection.
      </p>
      <Link
        href="/scan"
        style={{
          marginTop: 6,
          height: 44,
          paddingInline: 24,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 35,
          background: "var(--color-primary)",
          color: "var(--color-primary-fg)",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          textDecoration: "none",
          lineHeight: "16.2px",
        }}
      >
        Scanner maintenant
      </Link>
    </div>
  );
}
