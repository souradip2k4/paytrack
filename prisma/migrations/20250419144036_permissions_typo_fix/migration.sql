/*
  Warnings:

  - You are about to drop the column `perimissions` on the `ApiKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "perimissions",
ADD COLUMN     "permissions" "ApiAccessPermission"[] DEFAULT ARRAY['READONLY']::"ApiAccessPermission"[];

-- AlterTable
ALTER TABLE "_EntryToTag" ADD CONSTRAINT "_EntryToTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_EntryToTag_AB_unique";
