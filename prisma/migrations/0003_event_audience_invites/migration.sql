-- CreateEnum
CREATE TYPE "EventAudience" AS ENUM ('PUBLIC', 'SELECTED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "audience" "EventAudience" NOT NULL DEFAULT 'PUBLIC';

-- CreateTable
CREATE TABLE "EventInvite" (
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventInvite_pkey" PRIMARY KEY ("eventId","memberId")
);

-- CreateIndex
CREATE INDEX "EventInvite_memberId_idx" ON "EventInvite"("memberId");

-- AddForeignKey
ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
