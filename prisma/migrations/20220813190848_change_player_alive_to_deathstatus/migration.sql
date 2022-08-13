/*
  Warnings:

  - You are about to drop the column `alive` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Player` DROP COLUMN `alive`,
    ADD COLUMN `deathStatus` ENUM('ALIVE', 'DEAD', 'FAKED') NOT NULL DEFAULT 'ALIVE';
