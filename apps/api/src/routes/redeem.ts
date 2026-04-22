import { Router, type Request, type Response, type NextFunction } from "express";
import { RedeemInput } from "@repo/shared-schemas";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { ValidationError } from "../errors.js";
import { redeemReward } from "../services/redemption.js";

export const redeemRouter = Router();

/**
 * POST /api/redeem — atomic redemption.
 * PITFALL #7: userId derived from req.user.id (NEVER req.body).
 * Body: { rewardId: string }
 * 200: RedemptionResponse
 * 404: reward not found or inactive
 * 409: insufficient_balance
 */
redeemRouter.post(
  "/",
  requireAuth,
  requireRole("DINER"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthedRequest).user;
      const parsed = RedeemInput.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error);

      const { redemption, reward, newBalance } = await redeemReward({
        userId: user.id,
        rewardId: parsed.data.rewardId,
      });

      res.json({
        id: redemption.id,
        userId: redemption.userId,
        rewardId: redemption.rewardId,
        code: redemption.code,
        pointsSpent: redemption.pointsSpent,
        reward: {
          id: reward.id,
          title: reward.title,
          description: reward.description,
          pointsCost: reward.pointsCost,
          imageKey: reward.imageKey,
          active: reward.active,
          createdAt: reward.createdAt.toISOString(),
          updatedAt: reward.updatedAt.toISOString(),
        },
        createdAt: redemption.createdAt.toISOString(),
        newBalance,
      });
    } catch (err) {
      next(err);
    }
  },
);
