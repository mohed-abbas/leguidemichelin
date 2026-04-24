"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export function ChasseurHeader() {
  const router = useRouter();

  return (
    <header
      style={{
        position: "relative",
        height: 78,
      }}
    >
      <button
        type="button"
        aria-label="Retour"
        onClick={() => router.back()}
        style={{
          position: "absolute",
          top: 49,
          left: 16,
          width: 29,
          height: 29,
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image src="/icons/map/arrow-back.svg" alt="" width={29} height={29} priority />
      </button>
      <h1
        style={{
          position: "absolute",
          top: 51,
          left: "50%",
          transform: "translateX(-50%)",
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-ink)",
          lineHeight: "26px",
          whiteSpace: "nowrap",
        }}
      >
        Chasseur d’étoiles
      </h1>
    </header>
  );
}
