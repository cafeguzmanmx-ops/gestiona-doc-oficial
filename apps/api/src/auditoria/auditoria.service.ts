import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { JwtUser } from '../auth/types';
import { PrismaService } from '../database/prisma.service';

export type AuditRequestMeta = {
  ip?: string;
  userAgent?: string;
};

export type AuditLogInput = {
  tenantId?: string | null;
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  ip?: string;
  userAgent?: string;
};

export type AuditFilters = {
  tenantId?: string;
  action?: AuditAction;
  entity?: string;
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
};

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId ?? null,
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: input.metadata === undefined ? undefined : input.metadata as Prisma.InputJsonValue,
        ip: input.ip,
        userAgent: input.userAgent,
      },
    });
  }

  async logUserAction(user: JwtUser, action: AuditAction, entity: string, entityId?: string | null, metadata?: unknown) {
    return this.log({
      tenantId: user.tenantId,
      userId: user.sub,
      action,
      entity,
      entityId,
      metadata,
    });
  }

  async listForUser(user: JwtUser, filters: AuditFilters) {
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const tenantId = isSuperAdmin ? filters.tenantId : user.tenantId;

    const take = Math.min(Math.max(filters.limit ?? 100, 1), 250);

    return this.prisma.auditLog.findMany({
      where: {
        tenantId: tenantId ?? undefined,
        action: filters.action,
        entity: filters.entity,
        userId: filters.userId,
        createdAt: {
          gte: filters.from ? new Date(filters.from) : undefined,
          lte: filters.to ? new Date(filters.to) : undefined,
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
        tenant: { select: { id: true, name: true, slug: true, status: true } },
      },
    });
  }
}
