import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtUser } from '../auth/types';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async list(user: JwtUser) {
    const tenantId = this.requireTenant(user);
    return this.prisma.user.findMany({
      where: { tenantId },
      orderBy: [{ active: 'desc' }, { fullName: 'asc' }],
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        active: true,
        areaId: true,
        createdAt: true,
        area: { select: { id: true, name: true } },
      },
    });
  }

  async create(currentUser: JwtUser, dto: CreateUserDto) {
    const tenantId = this.requireTenant(currentUser);
    const normalizedEmail = dto.email.trim().toLowerCase();

    await this.validateArea(tenantId, dto.areaId);
    this.validateAssignableRole(dto.role);

    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new BadRequestException('El correo ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const created = await this.prisma.user.create({
      data: {
        tenantId,
        areaId: dto.areaId,
        email: normalizedEmail,
        passwordHash,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim(),
        position: dto.position?.trim(),
        role: dto.role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        active: true,
        areaId: true,
        area: { select: { id: true, name: true } },
      },
    });

    await this.auditoria.logUserAction(currentUser, AuditAction.USER_CREATED, 'User', created.id, { email: created.email, role: created.role });

    return created;
  }

  async update(currentUser: JwtUser, id: string, dto: UpdateUserDto) {
    const tenantId = this.requireTenant(currentUser);
    const target = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!target) throw new NotFoundException('Usuario no encontrado');

    if (dto.role) this.validateAssignableRole(dto.role);
    await this.validateArea(tenantId, dto.areaId ?? undefined);

    if (target.id === currentUser.sub && dto.active === false) {
      throw new BadRequestException('No puedes desactivar tu propio usuario');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName?.trim(),
        phone: dto.phone?.trim(),
        position: dto.position?.trim(),
        role: dto.role,
        areaId: dto.areaId === null ? null : dto.areaId,
        active: dto.active,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        active: true,
        areaId: true,
        area: { select: { id: true, name: true } },
      },
    });

    await this.auditoria.logUserAction(
      currentUser,
      dto.active === false ? AuditAction.USER_DEACTIVATED : AuditAction.USER_UPDATED,
      'User',
      updated.id,
      { email: updated.email, role: updated.role, active: updated.active },
    );

    return updated;
  }

  private requireTenant(user: JwtUser) {
    if (!user.tenantId) throw new ForbiddenException('Usuario sin municipio asignado');
    return user.tenantId;
  }

  private validateAssignableRole(role: UserRole) {
    if (role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('No se puede asignar SUPER_ADMIN desde el panel municipal');
    }
  }

  private async validateArea(tenantId: string, areaId?: string | null) {
    if (!areaId) return;
    const area = await this.prisma.area.findFirst({ where: { id: areaId, tenantId, active: true } });
    if (!area) throw new BadRequestException('Área no válida para este municipio');
  }
}
