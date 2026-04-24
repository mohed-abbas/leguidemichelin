import Image from "next/image";

function formatPoints(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function BalanceHero({ balance }: { balance: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        paddingBlock: 26,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-placeholder)",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Votre solde
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Image
          src="/images/chasseur/icon-star-mini-red.svg"
          alt=""
          width={32}
          height={37}
          aria-hidden
          priority
        />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 38,
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-primary)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
          }}
        >
          {formatPoints(balance)}
        </span>
      </div>
    </div>
  );
}
