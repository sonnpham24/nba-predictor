-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "displayName" TEXT,
    "bio" TEXT,
    "favoriteTeamId" INTEGER,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "scoreAdjustment" INTEGER NOT NULL DEFAULT 0,
    "emailVerifyCode" TEXT,
    "emailVerifyExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "teamA" TEXT NOT NULL,
    "teamB" TEXT NOT NULL,
    "predictedWinner" TEXT NOT NULL,
    "predictedScore" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matchup" (
    "id" SERIAL NOT NULL,
    "teamA" TEXT NOT NULL,
    "teamB" TEXT NOT NULL,
    "round" INTEGER,
    "conference" TEXT NOT NULL,
    "actualWinner" TEXT,
    "actualScore" TEXT,
    "lockTime" TIMESTAMP(3),

    CONSTRAINT "Matchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "color" TEXT,
    "conference" TEXT,
    "scrapedData" TEXT,
    "pendingData" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularMatchup" (
    "id" SERIAL NOT NULL,
    "espnId" TEXT,
    "teamAId" INTEGER,
    "teamBId" INTEGER,
    "customTeamA" TEXT,
    "customTeamB" TEXT,
    "customLogoA" TEXT,
    "customLogoB" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "clock" TEXT,
    "period" INTEGER,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "actualWinnerId" INTEGER,
    "customWinner" TEXT,
    "actualScore" TEXT,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "lockTime" TIMESTAMP(3) NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegularMatchup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularPrediction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "predictedWinnerId" INTEGER,
    "customPredictedWinner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegularPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegularProp" (
    "id" SERIAL NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "creatorId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "playerName" TEXT,
    "statType" TEXT,
    "threshold" DOUBLE PRECISION,
    "actualStatValue" DOUBLE PRECISION,
    "resolvedOutcome" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegularProp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropVote" (
    "id" SERIAL NOT NULL,
    "propId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_userId_matchupId_key" ON "Prediction"("userId", "matchupId");

-- CreateIndex
CREATE UNIQUE INDEX "RegularMatchup_espnId_key" ON "RegularMatchup"("espnId");

-- CreateIndex
CREATE UNIQUE INDEX "RegularPrediction_userId_matchupId_key" ON "RegularPrediction"("userId", "matchupId");

-- CreateIndex
CREATE UNIQUE INDEX "PropVote_userId_propId_key" ON "PropVote"("userId", "propId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_favoriteTeamId_fkey" FOREIGN KEY ("favoriteTeamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "Matchup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularMatchup" ADD CONSTRAINT "RegularMatchup_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularMatchup" ADD CONSTRAINT "RegularMatchup_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularMatchup" ADD CONSTRAINT "RegularMatchup_actualWinnerId_fkey" FOREIGN KEY ("actualWinnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularPrediction" ADD CONSTRAINT "RegularPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularPrediction" ADD CONSTRAINT "RegularPrediction_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "RegularMatchup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularPrediction" ADD CONSTRAINT "RegularPrediction_predictedWinnerId_fkey" FOREIGN KEY ("predictedWinnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularProp" ADD CONSTRAINT "RegularProp_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "RegularMatchup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegularProp" ADD CONSTRAINT "RegularProp_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropVote" ADD CONSTRAINT "PropVote_propId_fkey" FOREIGN KEY ("propId") REFERENCES "RegularProp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropVote" ADD CONSTRAINT "PropVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
