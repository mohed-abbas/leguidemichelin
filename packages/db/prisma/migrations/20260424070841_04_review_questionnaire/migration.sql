-- AlterEnum
ALTER TYPE "PointSource" ADD VALUE 'REVIEW_BONUS';

-- AlterTable
ALTER TABLE "PointTransaction" ADD COLUMN     "reviewId" TEXT;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "souvenirId" TEXT,
    "productsQuality" INTEGER NOT NULL,
    "cookingAccuracy" INTEGER NOT NULL,
    "worthTheVisit" INTEGER NOT NULL,
    "experienceSmooth" INTEGER NOT NULL,
    "valueForMoney" INTEGER NOT NULL,
    "consistency" INTEGER NOT NULL,
    "bonusPointsAwarded" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_souvenirId_key" ON "Review"("souvenirId");

-- CreateIndex
CREATE INDEX "Review_userId_createdAt_idx" ON "Review"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_restaurantId_idx" ON "Review"("restaurantId");

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "Souvenir"("id") ON DELETE SET NULL ON UPDATE CASCADE;
