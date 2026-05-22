import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtUser } from '../auth/types';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async current(user: JwtUser) {
    if (!user.tenantId) throw new ForbiddenException('Usuario sin municipio asignado');

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        state: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            planCode: true,
            status: true,
            startsAt: true,
            trialEndsAt: true,
            currentPeriodEndsAt: true,
          },
        },
        areas: {
          where: { active: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, code: true, parentId: true },
        },
      },
    });

    if (!tenant) throw new NotFoundException('Municipio no encontrado');
    return tenant;
  }
}
