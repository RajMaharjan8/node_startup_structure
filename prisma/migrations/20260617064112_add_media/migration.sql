/*
  Warnings:

  - Added the required column `mime_type` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail_url` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "thumbnail_url" TEXT NOT NULL;
