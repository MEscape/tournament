-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "preferences" TEXT,
ADD COLUMN     "shop" TEXT;

-- AlterTable
ALTER TABLE "ThemeSuggestion" ADD COLUMN     "budget" INTEGER,
ADD COLUMN     "preferences" TEXT,
ADD COLUMN     "shop" TEXT;
