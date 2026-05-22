-- Módulo 08 - Alertas internas y notificaciones por oficio

CREATE TYPE "NotificationType" AS ENUM (
  'OFICIO_ASIGNADO',
  'OFICIO_PROXIMO_VENCER',
  'OFICIO_VENCIDO',
  'OFICIO_CERRADO',
  'SUSCRIPCION_PROXIMA_VENCER'
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "oficioId" TEXT,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notifications_tenantId_userId_type_oficioId_key" ON "notifications"("tenantId", "userId", "type", "oficioId");
CREATE INDEX "notifications_tenantId_idx" ON "notifications"("tenantId");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_oficioId_idx" ON "notifications"("oficioId");
CREATE INDEX "notifications_tenantId_readAt_idx" ON "notifications"("tenantId", "readAt");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_oficioId_fkey" FOREIGN KEY ("oficioId") REFERENCES "oficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
