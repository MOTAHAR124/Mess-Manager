-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "MonthStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('INDIVIDUAL', 'SHARED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "profilePicture" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "phone" TEXT,
    "address" TEXT,
    "googleId" TEXT,
    "googleProfile" JSON,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mess" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "activeMonthId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessMember" (
    "id" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Month" (
    "id" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MonthStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Month_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "breakfast" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lunch" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dinner" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cost" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "CostType" NOT NULL,
    "memberId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostDistribution" (
    "id" TEXT NOT NULL,
    "costId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "messId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settlement" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "memberBalances" TEXT NOT NULL,
    "totalMealCost" DOUBLE PRECISION NOT NULL,
    "totalDeposit" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "settledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BazarDate" (
    "id" TEXT NOT NULL,
    "monthId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BazarDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mess_activeMonthId_key" ON "Mess"("activeMonthId");

-- CreateIndex
CREATE INDEX "Mess_managerId_idx" ON "Mess"("managerId");

-- CreateIndex
CREATE INDEX "Mess_activeMonthId_idx" ON "Mess"("activeMonthId");

-- CreateIndex
CREATE INDEX "MessMember_messId_idx" ON "MessMember"("messId");

-- CreateIndex
CREATE INDEX "MessMember_userId_idx" ON "MessMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessMember_messId_userId_key" ON "MessMember"("messId", "userId");

-- CreateIndex
CREATE INDEX "Month_messId_idx" ON "Month"("messId");

-- CreateIndex
CREATE INDEX "Month_status_idx" ON "Month"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Month_messId_name_key" ON "Month"("messId", "name");

-- CreateIndex
CREATE INDEX "Meal_monthId_idx" ON "Meal"("monthId");

-- CreateIndex
CREATE INDEX "Meal_messId_idx" ON "Meal"("messId");

-- CreateIndex
CREATE INDEX "Meal_memberId_idx" ON "Meal"("memberId");

-- CreateIndex
CREATE INDEX "Meal_date_idx" ON "Meal"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Meal_monthId_date_memberId_key" ON "Meal"("monthId", "date", "memberId");

-- CreateIndex
CREATE INDEX "Cost_monthId_idx" ON "Cost"("monthId");

-- CreateIndex
CREATE INDEX "Cost_messId_idx" ON "Cost"("messId");

-- CreateIndex
CREATE INDEX "Cost_type_idx" ON "Cost"("type");

-- CreateIndex
CREATE INDEX "CostDistribution_costId_idx" ON "CostDistribution"("costId");

-- CreateIndex
CREATE INDEX "CostDistribution_memberId_idx" ON "CostDistribution"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "CostDistribution_costId_memberId_key" ON "CostDistribution"("costId", "memberId");

-- CreateIndex
CREATE INDEX "Deposit_monthId_idx" ON "Deposit"("monthId");

-- CreateIndex
CREATE INDEX "Deposit_memberId_idx" ON "Deposit"("memberId");

-- CreateIndex
CREATE INDEX "Deposit_date_idx" ON "Deposit"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Settlement_monthId_key" ON "Settlement"("monthId");

-- CreateIndex
CREATE INDEX "Settlement_monthId_idx" ON "Settlement"("monthId");

-- CreateIndex
CREATE INDEX "BazarDate_monthId_idx" ON "BazarDate"("monthId");

-- CreateIndex
CREATE INDEX "BazarDate_memberId_idx" ON "BazarDate"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "BazarDate_monthId_date_key" ON "BazarDate"("monthId", "date");

-- AddForeignKey
ALTER TABLE "Mess" ADD CONSTRAINT "Mess_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mess" ADD CONSTRAINT "Mess_activeMonthId_fkey" FOREIGN KEY ("activeMonthId") REFERENCES "Month"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessMember" ADD CONSTRAINT "MessMember_messId_fkey" FOREIGN KEY ("messId") REFERENCES "Mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessMember" ADD CONSTRAINT "MessMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Month" ADD CONSTRAINT "Month_messId_fkey" FOREIGN KEY ("messId") REFERENCES "Mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_messId_fkey" FOREIGN KEY ("messId") REFERENCES "Mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cost" ADD CONSTRAINT "Cost_messId_fkey" FOREIGN KEY ("messId") REFERENCES "Mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostDistribution" ADD CONSTRAINT "CostDistribution_costId_fkey" FOREIGN KEY ("costId") REFERENCES "Cost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostDistribution" ADD CONSTRAINT "CostDistribution_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_messId_fkey" FOREIGN KEY ("messId") REFERENCES "Mess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BazarDate" ADD CONSTRAINT "BazarDate_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BazarDate" ADD CONSTRAINT "BazarDate_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MessMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
