"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { LoginInput, type LoginInputType } from "@repo/shared-schemas";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

/**
 * Validate the `next` param per D-08:
 *   - must startWith('/')
 *   - must NOT startWith('//') (protocol-relative URL defense)
 *   - must NOT include('://') (absolute URL defense)
 * Returns the safe path, or null.
 */
function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  if (next.includes("://")) return null;
  return next;
}

function redirectByRole(role: string): string {
  if (role === "RESTAURANT_STAFF") return "/portal/menu";
  return "/";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const form = useForm<LoginInputType>({
    resolver: zodResolver(LoginInput),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: LoginInputType) {
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error || !data) {
      toast.error("Email ou mot de passe incorrect.");
      form.setError("password", { message: " " }); // marks field without duplicating copy
      return;
    }
    const role = (data.user as { role?: string }).role ?? "DINER";
    const next = safeNext(params.get("next"));
    router.replace(next ?? redirectByRole(role));
    // router.replace alone reuses the RSC payload, so async layouts that
    // read the session keep serving their unauth branch. router.refresh
    // re-fetches server components so the bottom nav / sidebar appear.
    router.refresh();
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        padding: "var(--space-xl) var(--space-md)",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        maxWidth: "420px",
        marginInline: "auto",
        marginBlock: "var(--space-xl)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Connexion
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
          noValidate
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" inputMode="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </Form>
      <p
        style={{
          margin: 0,
          fontSize: "var(--font-size-sm)",
          color: "var(--color-ink-muted)",
        }}
      >
        Pas encore de compte ?{" "}
        <Link href="/signup" style={{ textDecoration: "underline" }}>
          S’inscrire
        </Link>
      </p>
    </section>
  );
}

/**
 * useSearchParams() forces a client-side bail-out during static generation,
 * so Next requires the consumer to live inside a Suspense boundary. The
 * fallback renders nothing (the form boots instantly on the client).
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
