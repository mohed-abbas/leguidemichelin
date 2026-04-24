/**
 * One-off migration: rebuild PointTransaction ledger + User.totalPoints
 * under the canonical star rule:
 *   - +1 star per souvenir mint   (source = SOUVENIR_MINT)
 *   - +1 star per Review submitted (source = REVIEW_BONUS)
 * No bonus is awarded by the souvenir mint itself — the bonus is the
 * separate ledger entry inserted by services/review.ts when the user
 * submits the questionnaire.
 *
 * Safe to run multiple times — wipes prior PointTransactions + Redemptions
 * for each user, then rebuilds from each user's Souvenir + Review history.
 *
 * Run with: npm run -w @repo/db migrate-to-stars
 */
import { prisma } from "../src/index.js";

async function main() {
  console.log("[migrate-to-stars] start");

  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  console.log(`[migrate-to-stars] ${users.length} users`);

  let totalSouvenirs = 0;
  let totalReviews = 0;
  let totalStars = 0;
  let totalRedemptionsRemoved = 0;

  for (const u of users) {
    const [souvenirs, reviews] = await Promise.all([
      prisma.souvenir.findMany({
        where: { userId: u.id },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      }),
      prisma.review.findMany({
        where: { userId: u.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, bonusPointsAwarded: true },
      }),
    ]);
    totalSouvenirs += souvenirs.length;
    totalReviews += reviews.length;

    const removed = await prisma.redemption.deleteMany({ where: { userId: u.id } });
    totalRedemptionsRemoved += removed.count;

    await prisma.pointTransaction.deleteMany({ where: { userId: u.id } });
    await prisma.user.update({ where: { id: u.id }, data: { totalPoints: 0 } });
    await prisma.souvenir.updateMany({ where: { userId: u.id }, data: { pointsAwarded: 1 } });

    let userStars = 0;

    // +1 SOUVENIR_MINT entry per souvenir.
    for (const s of souvenirs) {
      await prisma.$transaction(async (tx) => {
        await tx.pointTransaction.create({
          data: {
            userId: u.id,
            delta: 1,
            source: "SOUVENIR_MINT",
            souvenirId: s.id,
          },
        });
        await tx.user.update({
          where: { id: u.id },
          data: { totalPoints: { increment: 1 } },
        });
      });
      userStars += 1;
    }

    // +bonusPointsAwarded REVIEW_BONUS entry per review (default 1).
    for (const r of reviews) {
      const bonus = r.bonusPointsAwarded || 1;
      await prisma.$transaction(async (tx) => {
        await tx.pointTransaction.create({
          data: {
            userId: u.id,
            delta: bonus,
            source: "REVIEW_BONUS",
            reviewId: r.id,
          },
        });
        await tx.user.update({
          where: { id: u.id },
          data: { totalPoints: { increment: bonus } },
        });
      });
      userStars += bonus;
    }
    totalStars += userStars;

    if (souvenirs.length > 0 || reviews.length > 0) {
      console.log(
        `[migrate-to-stars] ${u.email}: ${souvenirs.length} mints + ${reviews.length} reviews = ${userStars} stars`,
      );
    }
  }

  console.log(
    `[migrate-to-stars] done — ${totalSouvenirs} souvenirs + ${totalReviews} reviews → ${totalStars} stars rebuilt; ${totalRedemptionsRemoved} stale redemptions removed`,
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
