import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { SubscriptionStatus, UserRole } from '@prisma/client';
import { JwtUser } from '../../auth/types';
import { PrismaService } from '../../database/prisma.service';

const ACTIVE_STATUSES = [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE];

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    const user = request.user;

    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN) return true;
    if (!user.tenantId) throw new ForbiddenException('Usuario sin municipio asignado');

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        status: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { status: true, trialEndsAt: true, currentPeriodEndsAt: true },
        },
      },
    });

    if (!tenant) throw new ForbiddenException('Municipio no encontrado');
    if (tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') {
      throw new ForbiddenException('La suscripción del municipio está suspendida');
    }

    const subscription = tenant.subscriptions[0];
    if (!subscription || !['TRIAL','ACTIVE'].includes(subscription.status)) {
      throw new ForbiddenException('El municipio no cuenta con una suscripción activa');
    }

    const now = new Date();
    if (subscription.status === SubscriptionStatus.TRIAL && subscription.trialEndsAt < now) {
      throw new ForbiddenException('El periodo de prueba del municipio ha vencido');
    }

    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.currentPeriodEndsAt && subscription.currentPeriodEndsAt < now) {
      throw new ForbiddenException('La suscripción anual del municipio ha vencido');
    }

    return true;
  }
}
