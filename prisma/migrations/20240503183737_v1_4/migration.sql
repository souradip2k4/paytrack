/*
  Warnings:

  - Added the required column `expire_at` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApiAccessPermission" AS ENUM ('ADMIN', 'ALL', 'READONLY', 'WRITE', 'CREATE', 'EDIT', 'DELETE');

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expire_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "perimissions" "ApiAccessPermission"[] DEFAULT ARRAY['READONLY']::"ApiAccessPermission"[];
