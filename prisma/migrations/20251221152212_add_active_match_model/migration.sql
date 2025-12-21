-- CreateEnum
CREATE TYPE "ActiveMatchStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ActiveMatch" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "player1Id" TEXT NOT NULL,
    "player1Name" TEXT NOT NULL,
    "player1Image" TEXT NOT NULL,
    "player1List" TEXT NOT NULL DEFAULT '',
    "player2Id" TEXT NOT NULL,
    "player2Name" TEXT NOT NULL,
    "player2Image" TEXT NOT NULL,
    "player2List" TEXT NOT NULL DEFAULT '',
    "winnerId" TEXT,
    "status" "ActiveMatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActiveMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActiveMatch_status_idx" ON "ActiveMatch"("status");

-- CreateIndex
CREATE INDEX "ActiveMatch_startedAt_idx" ON "ActiveMatch"("startedAt");

-- AddForeignKey
ALTER TABLE "ActiveMatch" ADD CONSTRAINT "ActiveMatch_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
