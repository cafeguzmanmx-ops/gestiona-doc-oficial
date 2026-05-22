import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, SubscriptionStatus, TenantStatus } from '@prisma/client';
import { JwtUser } from '../auth/types';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaService } from '../database/prisma.service';
import { UpdateSubscriptionDto } from './dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async listMunicipios() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { users: true, areas: true, oficios: true } },
      },
    });

    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      state: tenant.state,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status,
      createdAt: tenant.createdAt,
      subscription: tenant.subscriptions[0] ?? null,
      counts: tenant._count,
    }));
  }

  async municipioDetail(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptions: { orderBy: { createdAt: 'desc' } },
        users: { orderBy: { createdAt: 'asc' }, select: { id: true, fullName: true, email: true, role: true, active: true, createdAt: true } },
        areas: { orderBy: { name: 'asc' }, select: { id: true, name: true, active: true } },
        _count: { select: { oficios: true, archivos: true, seguimientos: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Municipio no encontrado');
    return tenant;
  }

  async updateSubscription(user: JwtUser, tenantId: string, dto: UpdateSubscriptionDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, include: { subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 } } });
    if (!tenant) throw new NotFoundException('Municipio no encontrado');

    const tenantStatus = this.toTenantStatus(dto.status);
    const currentPeriodEndsAt = dto.currentPeriodEndsAt ? new Date(dto.currentPeriodEndsAt) : this.addDays(new Date(), 365);
    const latest = tenant.subscriptions[0];

    await this.prisma.$transaction(async (tx) => {
      await tx.tenant.update({ where: { id: tenantId }, data: { status: tenantStatus } });

      if (latest) {
        await tx.subscription.update({
          where: { id: latest.id },
          data: {
            status: dto.status,
            planCode: dto.planCode ?? latest.planCode,
            currentPeriodEndsAt,
            annualPriceCentsMx: dto.annualPriceCentsMx ?? latest.annualPriceCentsMx,
          },
        });
      } else {
        await tx.subscription.create({
          data: {
            tenantId,
            status: dto.status,
            planCode: dto.planCode ?? 'MUNICIPAL_ANNUAL',
            trialEndsAt: currentPeriodEndsAt,
            currentPeriodEndsAt,
            annualPriceCentsMx: dto.annualPriceCentsMx,
          },
        });
      }
    });

    await this.auditoria.log({
      tenantId,
      userId: user.sub,
      action: AuditAction.SUBSCRIPTION_UPDATED,
      entity: 'Subscription',
      entityId: latest?.id ?? tenantId,
      metadata: { status: dto.status, tenantStatus, currentPeriodEndsAt: currentPeriodEndsAt.toISOString(), planCode: dto.planCode ?? latest?.planCode },
    });

    return this.municipioDetail(tenantId);
  }

  private toTenantStatus(status: SubscriptionStatus): TenantStatus {
    if (status === SubscriptionStatus.ACTIVE) return TenantStatus.ACTIVE;
    if (status === SubscriptionStatus.TRIAL) return TenantStatus.TRIAL;
    return TenantStatus.SUSPENDED;
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
