import Image from "next/image";

export function StarCountHero({ count }: { count: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        paddingBlock: 26,
      }}
    >
      <Image src="/images/chasseur/emblem-star-heart.svg" alt="" width={50} height={57} priority />
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 24,
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-ink)",
          lineHeight: "normal",
        }}
      >
        x{count}
      </span>
    </div>
  );
}
