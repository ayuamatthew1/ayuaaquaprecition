-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TECHNICIAN', 'FARMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "FarmStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PondType" AS ENUM ('EARTHEN', 'CONCRETE', 'TARPAULIN', 'FIBER', 'PLASTIC');

-- CreateEnum
CREATE TYPE "PondStatus" AS ENUM ('ACTIVE', 'EMPTY', 'STOCKING', 'HARVESTING', 'QUARANTINE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('WATER_MONITOR', 'FEEDING_CONTROLLER', 'CAMERA');

-- CreateEnum
CREATE TYPE "SensorStatus" AS ENUM ('NORMAL', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('PH', 'TEMPERATURE', 'DISSOLVED_OXYGEN', 'TURBIDITY', 'AMMONIA');

-- CreateEnum
CREATE TYPE "FeedingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FeedType" AS ENUM ('STARTER', 'GROWER', 'FINISHER', 'FLOATING', 'SINKING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PredictionType" AS ENUM ('WATER_QUALITY', 'DISEASE', 'GROWTH');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ALERT', 'FEEDING', 'DEVICE', 'SYSTEM', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'STRIPE');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FARMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "FarmStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pond" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PondType" NOT NULL,
    "status" "PondStatus" NOT NULL DEFAULT 'ACTIVE',
    "length" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "capacity" DOUBLE PRECISION,
    "waterVolume" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pond_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FishBatch" (
    "id" TEXT NOT NULL,
    "pondId" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "quantity" INTEGER NOT NULL,
    "averageWeight" DOUBLE PRECISION,
    "source" TEXT,
    "stockedAt" TIMESTAMP(3) NOT NULL,
    "expectedHarvestDate" TIMESTAMP(3),
    "harvestedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "pondId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "firmwareVersion" TEXT,
    "hardwareVersion" TEXT,
    "macAddress" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'OFFLINE',
    "installedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "batteryLevel" DOUBLE PRECISION,
    "signalStrength" DOUBLE PRECISION,
    "ipAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,
    "dissolvedOxygen" DOUBLE PRECISION NOT NULL,
    "turbidity" DOUBLE PRECISION NOT NULL,
    "ammonia" DOUBLE PRECISION,
    "conductivity" DOUBLE PRECISION,
    "salinity" DOUBLE PRECISION,
    "waterLevel" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedingSchedule" (
    "id" TEXT NOT NULL,
    "pondId" TEXT NOT NULL,
    "feedType" "FeedType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "feedTime" TIMESTAMP(3) NOT NULL,
    "repeatDays" TEXT[] DEFAULT ARRAY['DAILY']::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedHistory" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "fedAt" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "completedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "pondId" TEXT NOT NULL,
    "sensorReadingId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterQualityPrediction" (
    "id" TEXT NOT NULL,
    "pondId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "summary" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterQualityPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseasePrediction" (
    "id" TEXT NOT NULL,
    "pondId" TEXT NOT NULL,
    "disease" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "symptoms" TEXT,
    "recommendation" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiseasePrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Farm_ownerId_idx" ON "Farm"("ownerId");

-- CreateIndex
CREATE INDEX "Farm_status_idx" ON "Farm"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Pond_code_key" ON "Pond"("code");

-- CreateIndex
CREATE INDEX "Pond_farmId_idx" ON "Pond"("farmId");

-- CreateIndex
CREATE INDEX "Pond_status_idx" ON "Pond"("status");

-- CreateIndex
CREATE INDEX "FishBatch_pondId_idx" ON "FishBatch"("pondId");

-- CreateIndex
CREATE INDEX "FishBatch_stockedAt_idx" ON "FishBatch"("stockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Device_pondId_key" ON "Device"("pondId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "Device"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Device_macAddress_key" ON "Device"("macAddress");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "Device_lastSeenAt_idx" ON "Device"("lastSeenAt");

-- CreateIndex
CREATE INDEX "SensorReading_deviceId_idx" ON "SensorReading"("deviceId");

-- CreateIndex
CREATE INDEX "SensorReading_recordedAt_idx" ON "SensorReading"("recordedAt");

-- CreateIndex
CREATE INDEX "SensorReading_deviceId_recordedAt_idx" ON "SensorReading"("deviceId", "recordedAt");

-- CreateIndex
CREATE INDEX "FeedingSchedule_pondId_idx" ON "FeedingSchedule"("pondId");

-- CreateIndex
CREATE INDEX "FeedingSchedule_feedTime_idx" ON "FeedingSchedule"("feedTime");

-- CreateIndex
CREATE INDEX "FeedHistory_fedAt_idx" ON "FeedHistory"("fedAt");

-- CreateIndex
CREATE INDEX "FeedHistory_completedById_idx" ON "FeedHistory"("completedById");

-- CreateIndex
CREATE INDEX "Alert_pondId_idx" ON "Alert"("pondId");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "WaterQualityPrediction_pondId_idx" ON "WaterQualityPrediction"("pondId");

-- CreateIndex
CREATE INDEX "WaterQualityPrediction_generatedAt_idx" ON "WaterQualityPrediction"("generatedAt");

-- CreateIndex
CREATE INDEX "DiseasePrediction_pondId_idx" ON "DiseasePrediction"("pondId");

-- CreateIndex
CREATE INDEX "DiseasePrediction_generatedAt_idx" ON "DiseasePrediction"("generatedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_farmId_key" ON "Subscription"("farmId");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pond" ADD CONSTRAINT "Pond_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FishBatch" ADD CONSTRAINT "FishBatch_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingSchedule" ADD CONSTRAINT "FeedingSchedule_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedHistory" ADD CONSTRAINT "FeedHistory_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "FeedingSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedHistory" ADD CONSTRAINT "FeedHistory_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_sensorReadingId_fkey" FOREIGN KEY ("sensorReadingId") REFERENCES "SensorReading"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterQualityPrediction" ADD CONSTRAINT "WaterQualityPrediction_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiseasePrediction" ADD CONSTRAINT "DiseasePrediction_pondId_fkey" FOREIGN KEY ("pondId") REFERENCES "Pond"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
