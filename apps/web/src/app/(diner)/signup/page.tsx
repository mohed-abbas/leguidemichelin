"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SignupInput, type SignupInputType } from "@repo/shared-schemas";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<SignupInputType>({
    resolver: zodResolver(SignupInput),
    defaultValues: { email: "", password: "", displayName: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: SignupInputType) {
    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.displayName,
    });
    if (error) {
      const code = error.code ?? "";
      if (code === "USER_ALREADY_EXISTS" || code === "EMAIL_TAKEN") {
        form.setError("email", { message: "Cet email est déjà utilisé." });
      } else {
        toast.error(error.message ?? "Erreur lors de l’inscription.");
      }
      return;
    }
    router.replace("/onboarding");
    router.refresh();
  }

  const displayNameError = form.formState.errors.displayName?.message;
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div
      data-auth-surface
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "390px",
        marginInline: "auto",
        minHeight: "100dvh",
        background: "var(--color-bg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>
        {`[data-auth-surface] :where(button,a,input):focus-visible{outline:2px solid var(--color-primary);outline-offset:2px;border-radius:inherit;}`}
      </style>
      <Link
        href="/login"
        aria-label="Retour au choix de connexion"
        style={{
          position: "absolute",
          top: "20px",
          left: "16px",
          width: "29px",
          height: "29px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-full)",
          textDecoration: "none",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06)",
          zIndex: 3,
        }}
      >
        <svg width="14" height="11" viewBox="0 0 15 12" fill="none" aria-hidden>
          <path
            d="M0.434315 6.56569C0.12189 6.25327 0.12189 5.74674 0.434315 5.43432L5.52548 0.343143C5.8379 0.0307242 6.34443 0.0307242 6.65685 0.343143C6.96927 0.655562 6.96927 1.1621 6.65685 1.47452L2.13137 6L6.65685 10.5255C6.96927 10.8379 6.96927 11.3444 6.65685 11.6569C6.34443 11.9693 5.8379 11.9693 5.52548 11.6569L0.434315 6.56569ZM15 6V6.8H1V6V5.2H15V6Z"
            fill="var(--color-ink)"
          />
        </svg>
      </Link>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "112px",
          paddingInline: "16px",
        }}
      >
        <img
          src="/icons/map/flower-emblem.svg"
          alt=""
          width={20}
          height={22}
          style={{ display: "block", marginBottom: "14px" }}
        />

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-regular)",
            fontSize: "22px",
            lineHeight: "normal",
            letterSpacing: "-0.5px",
            color: "var(--color-ink)",
            textAlign: "center",
          }}
        >
          Créer un compte
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            fontFamily: "var(--font-sans)",
            fontWeight: "var(--font-weight-regular)",
            fontSize: "13px",
            lineHeight: "17px",
            color: "var(--color-ink)",
            textAlign: "center",
            maxWidth: "280px",
          }}
        >
          Commencez votre parcours étoilé et collectionnez vos souvenirs gastronomiques.
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          style={{
            width: "100%",
            maxWidth: "294px",
            marginTop: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <PillField
            label="Nom affiché"
            type="text"
            autoComplete="name"
            error={displayNameError}
            register={form.register("displayName")}
          />
          <PillField
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            error={emailError}
            register={form.register("email")}
          />
          <PillField
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            error={passwordError}
            register={form.register("password")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: "8px",
              height: "54px",
              width: "100%",
              borderRadius: "25px",
              background: "var(--color-primary)",
              color: "var(--color-primary-fg)",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontWeight: "var(--font-weight-medium)",
              fontSize: "16px",
              letterSpacing: "0.01em",
              cursor: isSubmitting ? "progress" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow: "0 4px 19px 0 rgba(186, 11, 47, 0.22), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
              transition:
                "transform 150ms var(--ease-standard), box-shadow 150ms var(--ease-standard), opacity 150ms var(--ease-standard)",
            }}
          >
            {isSubmitting ? "Création…" : "S’inscrire"}
          </button>

          <div
            style={{
              marginTop: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              lineHeight: "17px",
              color: "var(--color-ink)",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0 }}>
              Déjà un compte ?{" "}
              <Link
                href="/login"
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "underline",
                  textDecorationSkipInk: "none",
                  fontWeight: "var(--font-weight-medium)",
                }}
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>

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
          zIndex: 1,
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
            top: "49.5px",
            left: "42px",
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

interface PillFieldProps {
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  inputMode?: "email";
  error: string | undefined;
  register: UseFormRegisterReturn;
}

function PillField({ label, type, autoComplete, inputMode, error, register }: PillFieldProps) {
  const id = useId();
  const hasError = !!error && error.trim().length > 0;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder=" "
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-err` : undefined}
          {...register}
          style={{
            boxSizing: "border-box",
            width: "100%",
            height: "54px",
            borderRadius: "25px",
            border: `1px solid ${error ? "var(--color-primary)" : "transparent"}`,
            background: "var(--color-surface)",
            paddingInline: "24px",
            paddingTop: "14px",
            paddingBottom: "4px",
            fontFamily: "var(--font-sans)",
            fontSize: "16px",
            lineHeight: "20px",
            color: "var(--color-ink)",
            outline: "none",
            boxShadow: "0 4px 19px 0 rgba(0, 0, 0, 0.03)",
            transition:
              "border-color 150ms var(--ease-standard), box-shadow 150ms var(--ease-standard)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? "var(--color-primary)" : "var(--color-ink)";
            e.currentTarget.style.boxShadow = "0 4px 19px 0 rgba(0, 0, 0, 0.06)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? "var(--color-primary)" : "transparent";
            e.currentTarget.style.boxShadow = "0 4px 19px 0 rgba(0, 0, 0, 0.03)";
          }}
        />
        <label
          htmlFor={id}
          style={{
            position: "absolute",
            top: "16px",
            left: "24px",
            pointerEvents: "none",
            fontFamily: "var(--font-sans)",
            fontSize: "15px",
            lineHeight: "20px",
            color: "var(--color-placeholder)",
            transformOrigin: "left top",
            transition: "transform 140ms var(--ease-standard), color 140ms var(--ease-standard)",
            willChange: "transform",
          }}
          data-pill-label
        >
          {label}
        </label>
        <style>
          {`
            input:not(:placeholder-shown) + [data-pill-label],
            input:focus + [data-pill-label] {
              transform: translateY(-9px) scale(0.72);
              color: var(--color-ink-muted);
            }
          `}
        </style>
      </div>
      {hasError && (
        <p
          id={`${id}-err`}
          role="alert"
          style={{
            margin: "6px 0 0 22px",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            lineHeight: "16px",
            color: "var(--color-primary)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
