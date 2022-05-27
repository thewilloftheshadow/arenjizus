-- CreateEnum
CREATE TYPE "GiveawayType" AS ENUM ('NITRO', 'GIFT_CARD', 'DANK_MEMER', 'OTHER');

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initialSetup" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GiveawaySetting" (
    "guildId" TEXT NOT NULL,
    "type" "GiveawayType" NOT NULL,
    "ping" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voteTime" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT E'en',
    "lastPlayed" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Flag" (
    "userId" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "value" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Giveaway" (
    "id" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "startsAt" INTEGER NOT NULL,
    "endsAt" INTEGER NOT NULL,
    "type" "GiveawayType" NOT NULL,
    "doPing" BOOLEAN NOT NULL DEFAULT false,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "scheduled" BOOLEAN NOT NULL DEFAULT false,
    "canceled" BOOLEAN NOT NULL DEFAULT false,
    "winners" TEXT[],
    "oldWinners" TEXT[],
    "winnerCount" INTEGER NOT NULL,
    "embedId" TEXT NOT NULL,
    "message" TEXT,
    "staff" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Embed" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "footer" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EntryData" (
    "giveawayId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guild" TEXT[],
    "bonus" INTEGER NOT NULL,

    CONSTRAINT "EntryData_pkey" PRIMARY KEY ("giveawayId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_id_key" ON "Guild"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GiveawaySetting_guildId_type_key" ON "GiveawaySetting"("guildId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Flag_userId_flag_key" ON "Flag"("userId", "flag");

-- CreateIndex
CREATE UNIQUE INDEX "Giveaway_id_key" ON "Giveaway"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Embed_id_key" ON "Embed"("id");
