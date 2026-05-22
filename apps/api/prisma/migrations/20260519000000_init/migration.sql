-- Gestiona Doc 1.0 - Migración inicial
-- SaaS municipal multi-tenant por tenant_id.

CREATE TYPE "TenantStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN_MUNICIPAL', 'DIRECTOR_AREA', 'CAPTURISTA', 'CONSULTA');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE "AuditAction" AS ENUM ('TENANT_CREATED', 'USER_CREATED', 'USER_LOGIN', 'USER_LOGIN_FAILED', 'SUBSCRIPTION_CREATED');
CREATE TYPE "OficioStatus" AS ENUM ('RECIBIDO', 'TURNADO', 'EN_PROCESO', 'ATENDIDO', 'CERRADO', 'VENCIDO');
CREATE TYPE "OficioPriority" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');
CREATE TYPE "ArchivoTipo" AS ENUM ('OFICIO_RECIBIDO', 'ANEXO', 'RESPUESTA', 'SEGUIMIENTO');

CREATE TABLE "tenants" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "areas" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT,
  "parentId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "areaId" TEXT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT,
  "position" TEXT,
  "role" "UserRole" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "planCode" TEXT NOT NULL DEFAULT 'MUNICIPAL_PILOT',
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "trialEndsAt" TIMESTAMP(3) NOT NULL,
  "currentPeriodEndsAt" TIMESTAMP(3),
  "annualPriceCentsMx" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "userId" TEXT,
  "action" "AuditAction" NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "oficios" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "externalNumber" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderAgency" TEXT,
  "subject" TEXT NOT NULL,
  "description" TEXT,
  "priority" "OficioPriority" NOT NULL DEFAULT 'MEDIA',
  "dueAt" TIMESTAMP(3),
  "responsibleAreaId" TEXT,
  "status" "OficioStatus" NOT NULL DEFAULT 'RECIBIDO',
  "createdById" TEXT NOT NULL,
  "closedById" TEXT,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "oficios_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "archivos" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "oficioId" TEXT,
  "seguimientoId" TEXT,
  "uploadedById" TEXT NOT NULL,
  "tipo" "ArchivoTipo" NOT NULL DEFAULT 'ANEXO',
  "fileName" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "archivos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seguimientos" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "oficioId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "comment" TEXT NOT NULL,
  "statusFrom" "OficioStatus",
  "statusTo" "OficioStatus",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "seguimientos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

CREATE UNIQUE INDEX "areas_tenantId_name_key" ON "areas"("tenantId", "name");
CREATE INDEX "areas_tenantId_idx" ON "areas"("tenantId");

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "users_role_idx" ON "users"("role");

CREATE INDEX "subscriptions_tenantId_idx" ON "subscriptions"("tenantId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

CREATE UNIQUE INDEX "oficios_tenantId_folio_key" ON "oficios"("tenantId", "folio");
CREATE INDEX "oficios_tenantId_idx" ON "oficios"("tenantId");
CREATE INDEX "oficios_tenantId_status_idx" ON "oficios"("tenantId", "status");
CREATE INDEX "oficios_tenantId_responsibleAreaId_idx" ON "oficios"("tenantId", "responsibleAreaId");
CREATE INDEX "oficios_tenantId_dueAt_idx" ON "oficios"("tenantId", "dueAt");

CREATE INDEX "archivos_tenantId_idx" ON "archivos"("tenantId");
CREATE INDEX "archivos_oficioId_idx" ON "archivos"("oficioId");

CREATE INDEX "seguimientos_tenantId_idx" ON "seguimientos"("tenantId");
CREATE INDEX "seguimientos_oficioId_idx" ON "seguimientos"("oficioId");

ALTER TABLE "areas" ADD CONSTRAINT "areas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "areas" ADD CONSTRAINT "areas_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "oficios" ADD CONSTRAINT "oficios_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "oficios" ADD CONSTRAINT "oficios_responsibleAreaId_fkey" FOREIGN KEY ("responsibleAreaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "oficios" ADD CONSTRAINT "oficios_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "oficios" ADD CONSTRAINT "oficios_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "archivos" ADD CONSTRAINT "archivos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_oficioId_fkey" FOREIGN KEY ("oficioId") REFERENCES "oficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_seguimientoId_fkey" FOREIGN KEY ("seguimientoId") REFERENCES "seguimientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_oficioId_fkey" FOREIGN KEY ("oficioId") REFERENCES "oficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
