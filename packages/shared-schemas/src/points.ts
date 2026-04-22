import { z } from "zod";

export const PointSource = z.enum(["SOUVENIR_MINT", "REDEMPTION"]);
export type PointSourceType = z.infer<typeof PointSource>;

/** Single point ledger entry. */
export const PointTransactionResponse = z.object({
  id: z.string(),
  userId: z.string(),
  delta: z.number().int(), // + mint, - redemption
  source: PointSource,
  souvenirId: z.string().nullable(),
  redemptionId: z.string().nullable(),
  label: z.string(), // "Souvenir @ <restaurant>" or "Redeemed <reward>"
  createdAt: z.string(),
});
export type PointTransactionResponseType = z.infer<typeof PointTransactionResponse>;

/** GET /api/me/points response. */
export const MePointsResponse = z.object({
  balance: z.number().int().nonnegative(),
  ledger: z.array(PointTransactionResponse),
});
export type MePointsResponseType = z.infer<typeof MePointsResponse>;
