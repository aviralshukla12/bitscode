/*
  Warnings:

  - You are about to drop the column `refeerenceSolution` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `referenceSolutions` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Problem" DROP COLUMN "refeerenceSolution",
ADD COLUMN     "referenceSolutions" JSONB NOT NULL;
