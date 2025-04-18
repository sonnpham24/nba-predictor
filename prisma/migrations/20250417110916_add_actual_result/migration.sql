-- CreateTable
CREATE TABLE "Matchup" (
    "id" SERIAL NOT NULL,
    "teamA" TEXT NOT NULL,
    "teamB" TEXT NOT NULL,
    "round" INTEGER,
    "actualWinner" TEXT,
    "actualScore" TEXT,

    CONSTRAINT "Matchup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "Matchup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
