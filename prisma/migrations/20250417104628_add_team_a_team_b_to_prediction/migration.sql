/*
  Warnings:

  - Added the required column `teamA` to the `Prediction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamB` to the `Prediction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "teamA" TEXT NOT NULL,
ADD COLUMN     "teamB" TEXT NOT NULL;
