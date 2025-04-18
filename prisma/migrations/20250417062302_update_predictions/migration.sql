/*
  Warnings:

  - You are about to drop the column `teamA` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `teamB` on the `Prediction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,matchupId]` on the table `Prediction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `matchupId` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `predictedScore` to the `Prediction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prediction" DROP COLUMN "teamA",
DROP COLUMN "teamB",
ADD COLUMN     "matchupId" INTEGER NOT NULL,
ADD COLUMN     "predictedScore" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_userId_matchupId_key" ON "Prediction"("userId", "matchupId");
