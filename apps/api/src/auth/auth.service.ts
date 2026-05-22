import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuditAction, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../database/prisma.service';
import { BootstrapSuperAdminDto, LoginDto, RegisterMunicipioDto } from './dto';
import { AuthResponse } from './types';

type RequestMeta = { ip?: string; userAgent?: string };

type LoginAttempt = { count: number; firstAttemptAt: number; lockedUntil?: number };

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILED_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly failedLoginAttempts = new Map<string, LoginAttempt>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async registerMunicipio(dto: RegisterMunicipioDto, meta: RequestMeta): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const baseSlug = this.slugify(`${dto.municipioName}-${dto.state}`);
    const slug = await this.createUniqueSlug(baseSlug);
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const trialEndsAt = this.addDays(new Date(), 30);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.municipioName.trim(),
          slug,
          state: dto.state.trim(),
          phone: dto.phone?.trim(),
          email: normalizedEmail,
          status: 'TRIAL',
        },
      });

      const area = await tx.area.create({
        data: {
          tenantId: tenant.id,
          name: 'Presidencia Municipal',
          code: 'PRESIDENCIA',
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          areaId: area.id,
          email: normalizedEmail,
          passwordHash,
          fullName: dto.adminName.trim(),
          phone: dto.phone?.trim(),
          position: 'Administrador municipal',
          role: UserRole.ADMIN_MUNICIPAL,
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          status: 'TRIAL',
          planCode: 'MUNICIPAL_PILOT',
          trialEndsAt,
        },
      });

      await tx.auditLog.createMany({
        data: [
          {
            tenantId: tenant.id,
            userId: user.id,
            action: AuditAction.TENANT_CREATED,
            entity: 'Tenant',
            entityId: tenant.id,
            metadata: { source: 'self-service-registration', tenantName: tenant.name },
            ip: meta.ip,
            userAgent: meta.userAgent,
          },
          {
            tenantId: tenant.id,
            userId: user.id,
            action: AuditAction.USER_CREATED,
            entity: 'User',
            entityId: user.id,
            metadata: { role: user.role },
            ip: meta.ip,
            userAgent: meta.userAgent,
          },
          {
            tenantId: tenant.id,
            userId: user.id,
            action: AuditAction.SUBSCRIPTION_CREATED,
            entity: 'Subscription',
            entityId: subscription.id,
            metadata: { status: subscription.status, trialEndsAt },
            ip: meta.ip,
            userAgent: meta.userAgent,
          },
        ],
      });

      return { tenant, user };
    });

    return this.toAuthResponse(result.user.id);
  }


  async bootstrapSuperAdmin(dto: BootstrapSuperAdminDto, meta: RequestMeta): Promise<AuthResponse> {
    const expectedToken = this.config.get<string>('BOOTSTRAP_TOKEN');
    if (!expectedToken || dto.bootstrapToken !== expectedToken) {
      throw new UnauthorizedException('Token de inicialización inválido');
    }

    const existingSuperAdmin = await this.prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN } });
    if (existingSuperAdmin) {
      throw new BadRequestException('Ya existe un super administrador');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) throw new BadRequestException('El correo ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        tenantId: null,
        areaId: null,
        email: normalizedEmail,
        passwordHash,
        fullName: dto.fullName.trim(),
        position: 'Administrador SaaS',
        role: UserRole.SUPER_ADMIN,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: null,
        userId: user.id,
        action: AuditAction.USER_CREATED,
        entity: 'User',
        entityId: user.id,
        metadata: { role: UserRole.SUPER_ADMIN, source: 'bootstrap' },
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });

    return this.toAuthResponse(user.id);
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    this.ensureLoginNotLocked(normalizedEmail, meta);

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { tenant: true },
    });

    if (!user || !user.active) {
      await this.logFailedLogin(normalizedEmail, meta);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      await this.logFailedLogin(normalizedEmail, meta, user.id, user.tenantId);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.tenant?.status === 'SUSPENDED') {
      throw new UnauthorizedException('Municipio suspendido');
    }

    this.resetFailedLogin(normalizedEmail, meta);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
      this.prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: AuditAction.USER_LOGIN,
          entity: 'User',
          entityId: user.id,
          metadata: { email: normalizedEmail },
          ip: meta.ip,
          userAgent: meta.userAgent,
        },
      }),
    ]);

    return this.toAuthResponse(user.id);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        position: true,
        role: true,
        tenantId: true,
        areaId: true,
        active: true,
        tenant: { select: { id: true, name: true, slug: true, state: true, status: true } },
        area: { select: { id: true, name: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }

  private async toAuthResponse(userId: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        areaId: true,
        tenant: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      areaId: user.areaId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
        areaId: user.areaId,
      },
      tenant: user.tenant,
    };
  }

  private async logFailedLogin(email: string, meta: RequestMeta, userId?: string, tenantId?: string | null) {
    this.recordFailedLogin(email, meta);
    await this.prisma.auditLog.create({
      data: {
        tenantId: tenantId ?? null,
        userId: userId ?? null,
        action: AuditAction.USER_LOGIN_FAILED,
        entity: 'User',
        metadata: { email },
        ip: meta.ip,
        userAgent: meta.userAgent,
      },
    });
  }

  private loginAttemptKey(email: string, meta: RequestMeta) {
    return `${email}:${meta.ip ?? 'unknown-ip'}`;
  }

  private ensureLoginNotLocked(email: string, meta: RequestMeta) {
    const key = this.loginAttemptKey(email, meta);
    const attempt = this.failedLoginAttempts.get(key);
    if (!attempt) return;

    const now = Date.now();
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      throw new UnauthorizedException('Demasiados intentos fallidos. Intenta nuevamente en unos minutos.');
    }

    if (now - attempt.firstAttemptAt > LOGIN_WINDOW_MS) {
      this.failedLoginAttempts.delete(key);
    }
  }

  private recordFailedLogin(email: string, meta: RequestMeta) {
    const key = this.loginAttemptKey(email, meta);
    const now = Date.now();
    const current = this.failedLoginAttempts.get(key);

    if (!current || now - current.firstAttemptAt > LOGIN_WINDOW_MS) {
      this.failedLoginAttempts.set(key, { count: 1, firstAttemptAt: now });
      return;
    }

    current.count += 1;
    if (current.count >= LOGIN_MAX_FAILED_ATTEMPTS) {
      current.lockedUntil = now + LOGIN_LOCK_MS;
    }
    this.failedLoginAttempts.set(key, current);
  }

  private resetFailedLogin(email: string, meta: RequestMeta) {
    this.failedLoginAttempts.delete(this.loginAttemptKey(email, meta));
  }

  private slugify(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 60) || 'municipio';
  }

  private async createUniqueSlug(baseSlug: string) {
    let slug = baseSlug;
    let suffix = 1;

    while (await this.prisma.tenant.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
