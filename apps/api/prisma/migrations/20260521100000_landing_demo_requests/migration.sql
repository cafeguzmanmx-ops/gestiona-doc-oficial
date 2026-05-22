-- Módulo 10 - Landing comercial y solicitudes de demo
-- Permite capturar prospectos desde la página pública y darles seguimiento desde el panel SaaS.

ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DEMO_REQUEST_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'DEMO_REQUEST_UPDATED';

CREATE TYPE "DemoRequestStatus" AS ENUM ('NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'WON', 'LOST');

CREATE TABLE "demo_requests" (
  "id" TEXT NOT NULL,
  "municipioName" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "position" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "estimatedUsers" INTEGER,
  "message" TEXT,
  "source" TEXT DEFAULT 'landing',
  "status" "DemoRequestStatus" NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "demo_requests_status_idx" ON "demo_requests"("status");
CREATE INDEX "demo_requests_state_idx" ON "demo_requests"("state");
CREATE INDEX "demo_requests_createdAt_idx" ON "demo_requests"("createdAt");
