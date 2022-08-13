/*
  Warnings:

  - You are about to alter the column `alive` on the `Player` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum("Player_alive")`.
  - You are about to drop the `PlayerBallData` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Player` MODIFY `alive` ENUM('ALIVE', 'DEAD', 'FAKED') NOT NULL DEFAULT 'ALIVE';

-- DropTable
DROP TABLE `PlayerBallData`;

-- CreateIndex
CREATE UNIQUE INDEX `Item_name_key` ON `Item`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Player_name_key` ON `Player`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Role_name_key` ON `Role`(`name`);
