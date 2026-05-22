import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { JwtUser } from '../auth/types';
import { CreateAreaDto, UpdateAreaDto } from './dto';

@Injectable()
export class AreasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async list(user: JwtUser) {
    const tenantId = this.requireTenant(user);
    return this.prisma.area.findMany({
      where: { tenantId, active: true },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        code: true,
        parentId: true,
        active: true,
        createdAt: true,
        parent: { select: { id: true, name: true } },
        _count: { select: { users: true } },
      },
    });
  }

  async create(user: JwtUser, dto: CreateAreaDto) {
    const tenantId = this.requireTenant(user);
    await this.validateParent(tenantId, dto.parentId);

    try {
      const created = await this.prisma.area.create({
        data: {
          tenantId,
          name: dto.name.trim(),
          code: dto.code?.trim().toUpperCase(),
          parentId: dto.parentId,
        },
      });
      await this.auditoria.logUserAction(user, AuditAction.AREA_CREATED, 'Area', created.id, { name: created.name, code: created.code });
      return created;
    } catch (error) {
      throw new BadRequestException('No se pudo crear el área. Verifica que no esté duplicada.');
    }
  }

  async update(user: JwtUser, id: string, dto: UpdateAreaDto) {
    const tenantId = this.requireTenant(user);
    const area = await this.findTenantArea(tenantId, id);

    if (dto.parentId && dto.parentId === area.id) {
      throw new BadRequestException('Un área no puede ser su propia superior jerárquica');
    }

    await this.validateParent(tenantId, dto.parentId ?? undefined);

    const updated = await this.prisma.area.update({
      where: { id: area.id },
      data: {
        name: dto.name?.trim(),
        code: dto.code?.trim().toUpperCase(),
        parentId: dto.parentId === null ? null : dto.parentId,
      },
    });
    await this.auditoria.logUserAction(user, AuditAction.AREA_UPDATED, 'Area', updated.id, { name: updated.name, code: updated.code });
    return updated;
  }

  async deactivate(user: JwtUser, id: string) {
    const tenantId = this.requireTenant(user);
    const area = await this.findTenantArea(tenantId, id);

    const activeUsers = await this.prisma.user.count({ where: { tenantId, areaId: id, active: true } });
    if (activeUsers > 0) {
      throw new BadRequestException('No se puede desactivar un área con usuarios activos asignados');
    }

    const updated = await this.prisma.area.update({ where: { id: area.id }, data: { active: false } });
    await this.auditoria.logUserAction(user, AuditAction.AREA_DEACTIVATED, 'Area', updated.id, { name: updated.name });
    return updated;
  }

  private requireTenant(user: JwtUser) {
    if (!user.tenantId) throw new ForbiddenException('Usuario sin municipio asignado');
    return user.tenantId;
  }

  private async validateParent(tenantId: string, parentId?: string | null) {
    if (!parentId) return;
    const parent = await this.prisma.area.findFirst({ where: { id: parentId, tenantId, active: true } });
    if (!parent) throw new BadRequestException('Área superior no válida');
  }

  private async findTenantArea(tenantId: string, id: string) {
    const area = await this.prisma.area.findFirst({ where: { id, tenantId, active: true } });
    if (!area) throw new NotFoundException('Área no encontrada');
    return area;
  }
}
