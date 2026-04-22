"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SignupInput, type SignupInputType } from "@repo/shared-schemas";
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
      // Better Auth error shape: { code, message, status } in most cases.
      const code = error.code ?? "";
      if (code === "USER_ALREADY_EXISTS" || code === "EMAIL_TAKEN") {
        form.setError("email", { message: "Cet email est déjà utilisé." });
      } else {
        toast.error(error.message ?? "Erreur lors de l’inscription.");
      }
      return;
    }
    router.replace("/");
    // Re-fetch server components so the async diner layout picks up the new
    // session cookie and renders the bottom nav.
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
        Créer un compte
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
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom affiché</FormLabel>
                <FormControl>
                  <Input type="text" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Création…" : "S’inscrire"}
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
        Déjà un compte ?{" "}
        <Link href="/login" style={{ textDecoration: "underline" }}>
          Se connecter
        </Link>
      </p>
    </section>
  );
}
