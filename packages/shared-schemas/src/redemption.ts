import { z } from "zod";

/**
 * POST /api/redeem body.
 * Client picks a reward; server derives userId from session (PITFALL #7).
 */
export const RedeemInput = z.object({
  rewardId: z.string().min(1),
});
export type RedeemInputType = z.infer<typeof RedeemInput>;

/** GET /api/rewards item. */
export const RewardResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  pointsCost: z.number().int().positive(),
  imageKey: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RewardResponseType = z.infer<typeof RewardResponse>;

/**
 * POST /api/redeem 200 response + GET /api/me/redemptions item shape.
 * `code` is the mock redemption code the diner shows at redemption.
 */
export const RedemptionResponse = z.object({
  id: z.string(),
  userId: z.string(),
  rewardId: z.string(),
  code: z.string(),
  pointsSpent: z.number().int().positive(),
  reward: RewardResponse,
  createdAt: z.string(),
});
export type RedemptionResponseType = z.infer<typeof RedemptionResponse>;
