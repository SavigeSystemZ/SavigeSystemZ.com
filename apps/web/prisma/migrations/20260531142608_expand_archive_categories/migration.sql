-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ArchiveCategory" ADD VALUE 'HACKING_CONTENT';
ALTER TYPE "ArchiveCategory" ADD VALUE 'GAMES';
ALTER TYPE "ArchiveCategory" ADD VALUE 'BOOKS';
ALTER TYPE "ArchiveCategory" ADD VALUE 'TUTORIALS';
ALTER TYPE "ArchiveCategory" ADD VALUE 'SOFTWARE_FREEWARE';
ALTER TYPE "ArchiveCategory" ADD VALUE 'AI_META_SYSTEMS';
ALTER TYPE "ArchiveCategory" ADD VALUE 'OPNSENSE_BUILDS';
