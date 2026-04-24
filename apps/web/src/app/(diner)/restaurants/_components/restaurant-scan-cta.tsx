import Link from "next/link";

interface RestaurantScanCtaProps {
  restaurantId: string;
}

export function RestaurantScanCta({ restaurantId }: RestaurantScanCtaProps) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: "calc(85px + env(safe-area-inset-bottom) + 12px)",
        display: "flex",
        justifyContent: "center",
        paddingInline: "16px",
        pointerEvents: "none",
        zIndex: "var(--z-sticky)",
      }}
    >
      <Link
        href={`/scan/${restaurantId}`}
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          background: "var(--color-primary)",
          color: "var(--color-primary-fg)",
          borderRadius: "35px",
          height: "44px",
          paddingInline: "24px",
          width: "296px",
          maxWidth: "100%",
          fontFamily: "var(--font-sans)",
          fontWeight: 300,
          fontSize: "14px",
          lineHeight: "16.2px",
          textAlign: "center",
          textDecoration: "none",
          boxShadow: "0 4px 16px 0 rgb(0 0 0 / 0.25)",
        }}
      >
        <span>
          Scanne ton ticket de caisse
          <br />
          et gagne des étoiles
        </span>
        <img
          src="/icons/map/flower-emblem.svg"
          alt=""
          width={20}
          height={22}
          style={{
            flexShrink: 0,
            filter: "brightness(0) invert(1)",
          }}
        />
      </Link>
    </div>
  );
}
