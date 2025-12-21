/*
  Warnings:

  - You are about to drop the `ActiveMatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ActiveMatch" DROP CONSTRAINT "ActiveMatch_themeId_fkey";

-- DropTable
DROP TABLE "ActiveMatch";

-- DropEnum
DROP TYPE "ActiveMatchStatus";
