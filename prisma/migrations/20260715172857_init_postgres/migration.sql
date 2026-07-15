-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT,
    "foundingAncestorId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "birthDate" TIMESTAMP(3),
    "birthDateLunar" TEXT,
    "deathDate" TIMESTAMP(3),
    "deathDateLunar" TEXT,
    "isDead" BOOLEAN NOT NULL DEFAULT false,
    "biography" TEXT,
    "photoUrl" TEXT,
    "placeOfBirth" TEXT,
    "placeOfBurial" TEXT,
    "branch" TEXT,
    "fatherId" TEXT,
    "motherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marriage" (
    "id" TEXT NOT NULL,
    "member1Id" TEXT NOT NULL,
    "member2Id" TEXT NOT NULL,
    "marriedAt" TIMESTAMP(3),
    "divorcedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Marriage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeathAnniversary" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "lunarDay" INTEGER NOT NULL,
    "lunarMonth" INTEGER NOT NULL,
    "isLeapMonth" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeathAnniversary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Marriage_member1Id_member2Id_key" ON "Marriage"("member1Id", "member2Id");

-- CreateIndex
CREATE UNIQUE INDEX "DeathAnniversary_memberId_key" ON "DeathAnniversary"("memberId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_member1Id_fkey" FOREIGN KEY ("member1Id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marriage" ADD CONSTRAINT "Marriage_member2Id_fkey" FOREIGN KEY ("member2Id") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathAnniversary" ADD CONSTRAINT "DeathAnniversary_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
