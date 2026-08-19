-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "color" TEXT,
    "conference" TEXT,
    "scrapedData" TEXT,
    "pendingData" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RegularMatchup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "espnId" TEXT,
    "teamAId" INTEGER NOT NULL,
    "teamBId" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "clock" TEXT,
    "period" INTEGER,
    "scoreA" INTEGER,
    "scoreB" INTEGER,
    "actualWinnerId" INTEGER,
    "actualScore" TEXT,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "lockTime" DATETIME NOT NULL,
    "openTime" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegularMatchup_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegularMatchup_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegularMatchup_actualWinnerId_fkey" FOREIGN KEY ("actualWinnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegularPrediction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "matchupId" INTEGER NOT NULL,
    "predictedWinnerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegularPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegularPrediction_matchupId_fkey" FOREIGN KEY ("matchupId") REFERENCES "RegularMatchup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegularPrediction_predictedWinnerId_fkey" FOREIGN KEY ("predictedWinnerId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "RegularMatchup_espnId_key" ON "RegularMatchup"("espnId");

-- CreateIndex
CREATE UNIQUE INDEX "RegularPrediction_userId_matchupId_key" ON "RegularPrediction"("userId", "matchupId");
