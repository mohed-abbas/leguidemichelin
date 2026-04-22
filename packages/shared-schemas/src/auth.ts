import { z } from "zod";

/**
 * Signup input — diner-only public signup (D-01).
 * `displayName` maps to Better Auth's required `User.name` column.
 * Rules locked in CONTEXT.md D-18.
 */
export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80),
});
export type SignupInputType = z.infer<typeof SignupInput>;

/**
 * Login input — shared by diner /login and portal /portal/login.
 * Password has no length check here (D-18) — Better Auth answers credentials.
 */
export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInputType = z.infer<typeof LoginInput>;
