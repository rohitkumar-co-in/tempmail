-- CreateTable
CREATE TABLE "gmail_config" (
    "id" TEXT NOT NULL DEFAULT 'gmail_config',
    "refreshToken" TEXT NOT NULL,
    "email" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_config_pkey" PRIMARY KEY ("id")
);
