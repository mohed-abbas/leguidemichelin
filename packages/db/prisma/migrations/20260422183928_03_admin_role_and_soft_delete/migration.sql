-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "disabledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "disabledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Restaurant_lat_lng_idx" ON "Restaurant"("lat", "lng");
