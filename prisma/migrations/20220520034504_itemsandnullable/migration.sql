-- AlterTable
ALTER TABLE "Embed" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "thumbnail" DROP NOT NULL,
ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "footer" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Giveaway" ALTER COLUMN "startsAt" DROP NOT NULL,
ALTER COLUMN "endsAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Item" (
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "feedable" BOOLEAN NOT NULL DEFAULT false,
    "feedValue" INTEGER NOT NULL DEFAULT 0,
    "playChance" INTEGER NOT NULL DEFAULT 0,
    "canCode" BOOLEAN NOT NULL DEFAULT true,
    "redeemable" BOOLEAN NOT NULL DEFAULT false,
    "redeemItems" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");
