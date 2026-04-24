"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Diner entry — "S'inscrire ou se connecter" (Figma node 0:728).
 *
 * Pixel-accurate rebuild of the Figma frame (390 × 844). Spacing comes from
 * absolute coordinates in the design; only Email is wired to the working
 * auth flow for now — Apple / Google are placeholders until OAuth lands.
 */
export default function LoginChooserPage() {
  const router = useRouter();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "390px",
        marginInline: "auto",
        minHeight: "100dvh",
        background: "var(--color-bg)",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          margin: 0,
          position: "absolute",
          top: "138px",
          left: "16px",
          right: "16px",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "22px",
          lineHeight: "normal",
          letterSpacing: "-0.5px",
          color: "var(--color-ink)",
          textAlign: "center",
        }}
      >
        S’inscrire ou se connecter
      </h1>

      <p
        style={{
          margin: 0,
          position: "absolute",
          top: "180px",
          left: "16px",
          right: "16px",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "13px",
          lineHeight: "17px",
          color: "var(--color-ink)",
          textAlign: "center",
          whiteSpace: "pre-wrap",
        }}
      >
        {"Vous inscrire vous permet de personnaliser votre\n"}
        {"expérience, créer et sauvegarder des listes,\n"}
        {"gérer vos réservations d’hôtels et plus encore."}
      </p>

      <p
        style={{
          margin: 0,
          position: "absolute",
          top: "273px",
          left: "58px",
          right: "38px",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "13px",
          lineHeight: "17px",
          color: "var(--color-ink)",
          textAlign: "center",
        }}
      >
        Continuer avec :
      </p>

      <ChooserButton
        label="Email"
        icon={<EmailIcon />}
        top={297}
        onClick={() => router.push("/login/email")}
        aria-label="Continuer avec Email"
      />
      <ChooserButton
        label="Apple"
        icon={<AppleIcon />}
        top={365}
        onClick={() => toast.info("Connexion Apple bientôt disponible.")}
        aria-label="Continuer avec Apple"
      />
      <ChooserButton
        label="Google"
        icon={<GoogleIcon />}
        top={433}
        onClick={() => toast.info("Connexion Google bientôt disponible.")}
        aria-label="Continuer avec Google"
      />

      <div
        style={{
          position: "absolute",
          top: "512px",
          left: "58px",
          right: "38px",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "13px",
          lineHeight: "17px",
          color: "var(--color-ink)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>En m’inscrivant, j’accepte les</p>
        <Link
          href="/legal/terms"
          style={{
            textDecoration: "underline",
            textDecorationSkipInk: "none",
            color: "inherit",
            display: "block",
          }}
        >
          Conditions Générales
        </Link>
        <Link
          href="/legal/privacy"
          style={{
            textDecoration: "underline",
            textDecorationSkipInk: "none",
            color: "inherit",
            display: "block",
          }}
        >
          Politique de confidentialité
        </Link>
      </div>

      {/* Hero dish — anchored bottom-left so the photo always bleeds to the
          viewport bottom on any height (Figma crop: x=-26, w=434, top=626,
          image natively 435px tall but visible tail is the top ~218px). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "626px",
          bottom: 0,
          left: "-26px",
          width: "434px",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/auth/hero-dish.png"
          alt=""
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "top left" }}
          sizes="434px"
        />
        <div
          style={{
            position: "absolute",
            top: "49.5px" /* 675.5 - 626 */,
            left: "42px" /* 16 - (-26) */,
            width: "117px",
            height: "51px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-medium)",
            fontSize: "8px",
            lineHeight: "normal",
            color: "var(--color-watermark)",
            letterSpacing: "0.02em",
          }}
        >
          <span>THE RESTAURANT</span>
          <span>ZURICH</span>
        </div>
      </div>
    </div>
  );
}

function ChooserButton({
  label,
  icon,
  top,
  onClick,
  "aria-label": ariaLabel,
}: {
  label: string;
  icon: React.ReactNode;
  top: number;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        position: "absolute",
        top: `${top}px`,
        left: "48px",
        width: "294px",
        height: "54px",
        background: "var(--color-surface)",
        border: "none",
        borderRadius: "25px",
        boxShadow: "0 4px 19px 0 rgba(0, 0, 0, 0.03)",
        cursor: "pointer",
        padding: 0,
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--font-weight-regular)",
        fontSize: "16px",
        lineHeight: "17px",
        color: "var(--color-ink)",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "26px" /* ≈ 8.84% of 294 */,
          transform: "translateY(-50%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function EmailIcon() {
  return (
    <img
      src="/images/auth/icon-email.svg"
      alt=""
      width={24}
      height={17}
      style={{ display: "block" }}
    />
  );
}

function AppleIcon() {
  return (
    <img
      src="/images/auth/icon-apple.svg"
      alt=""
      width={18}
      height={21}
      style={{ display: "block" }}
    />
  );
}

function GoogleIcon() {
  return (
    <img
      src="/images/auth/icon-google.svg"
      alt=""
      width={15}
      height={15}
      style={{ display: "block" }}
    />
  );
}
