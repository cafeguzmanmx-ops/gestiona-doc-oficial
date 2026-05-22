import { Injectable } from '@nestjs/common';
import { AuditAction, OficioPriority, OficioStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { JwtUser } from '../auth/types';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DemoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async createMunicipioDemo(user: JwtUser) {
    const slug = 'municipio-demo-san-miguel';
    const existing = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { users: { select: { email: true, role: true } }, areas: true, _count: { select: { oficios: true } } },
    });

    if (existing) {
      return {
        created: false,
        tenant: existing,
        credentials: this.demoCredentials(),
        message: 'El municipio demo ya existía. Se devuelven las credenciales de demostración.',
      };
    }

    const passwordHash = await bcrypt.hash('Demo12345!', 12);
    const now = new Date();
    const trialEndsAt = this.addDays(now, 365);

    const tenant = await this.prisma.$transaction(async (tx) => {
      const createdTenant = await tx.tenant.create({
        data: {
          name: 'Municipio Demo de San Miguel',
          slug,
          state: 'Veracruz',
          phone: '2280000000',
          email: 'admin.demo@gestionadoc.mx',
          status: 'ACTIVE',
        },
      });

      const presidencia = await tx.area.create({ data: { tenantId: createdTenant.id, name: 'Presidencia Municipal', code: 'PRESIDENCIA' } });
      const secretaria = await tx.area.create({ data: { tenantId: createdTenant.id, name: 'Secretaría del Ayuntamiento', code: 'SECRETARIA', parentId: presidencia.id } });
      const tesoreria = await tx.area.create({ data: { tenantId: createdTenant.id, name: 'Tesorería Municipal', code: 'TESORERIA', parentId: presidencia.id } });
      const obras = await tx.area.create({ data: { tenantId: createdTenant.id, name: 'Obras Públicas', code: 'OBRAS', parentId: presidencia.id } });
      const contraloria = await tx.area.create({ data: { tenantId: createdTenant.id, name: 'Contraloría Municipal', code: 'CONTRALORIA', parentId: presidencia.id } });
      const desarrollo = await tx.area.create({ data: { tenantId: createdTenant.id, name: 'Desarrollo Social', code: 'DESARROLLO', parentId: presidencia.id } });
      const juridico = await tx.area.create({ data: { tenantId: createdTenant.id, name: 'Jurídico', code: 'JURIDICO', parentId: presidencia.id } });

      const admin = await tx.user.create({
        data: {
          tenantId: createdTenant.id,
          areaId: presidencia.id,
          email: 'admin.demo@gestionadoc.mx',
          passwordHash,
          fullName: 'Administrador Demo',
          phone: '2280000000',
          position: 'Administrador municipal',
          role: UserRole.ADMIN_MUNICIPAL,
        },
      });

      await tx.user.createMany({
        data: [
          { tenantId: createdTenant.id, areaId: secretaria.id, email: 'secretaria.demo@gestionadoc.mx', passwordHash, fullName: 'María Hernández López', position: 'Secretaria del Ayuntamiento', role: UserRole.DIRECTOR_AREA },
          { tenantId: createdTenant.id, areaId: obras.id, email: 'obras.demo@gestionadoc.mx', passwordHash, fullName: 'Carlos Méndez Ruiz', position: 'Director de Obras Públicas', role: UserRole.DIRECTOR_AREA },
          { tenantId: createdTenant.id, areaId: contraloria.id, email: 'contraloria.demo@gestionadoc.mx', passwordHash, fullName: 'Ana Patricia Torres', position: 'Contralora Municipal', role: UserRole.DIRECTOR_AREA },
          { tenantId: createdTenant.id, areaId: presidencia.id, email: 'captura.demo@gestionadoc.mx', passwordHash, fullName: 'Luis García Pérez', position: 'Oficialía de partes', role: UserRole.CAPTURISTA },
        ],
      });

      await tx.subscription.create({
        data: {
          tenantId: createdTenant.id,
          planCode: 'MUNICIPAL_DEMO_ANUAL',
          status: 'ACTIVE',
          trialEndsAt,
          currentPeriodEndsAt: trialEndsAt,
          annualPriceCentsMx: 0,
        },
      });

      const oficios = [
        {
          folio: 'GD-2026-000001',
          externalNumber: 'SGG/012/2026',
          receivedAt: this.addDays(now, -8),
          senderName: 'Subsecretaría de Gobierno',
          senderAgency: 'Gobierno del Estado de Veracruz',
          subject: 'Solicitud de informe sobre avance de obras comunitarias',
          description: 'Se solicita informe ejecutivo con evidencia documental de las obras prioritarias del trimestre.',
          priority: OficioPriority.ALTA,
          dueAt: this.addDays(now, 5),
          responsibleAreaId: obras.id,
          status: OficioStatus.EN_PROCESO,
        },
        {
          folio: 'GD-2026-000002',
          externalNumber: 'CM/045/2026',
          receivedAt: this.addDays(now, -15),
          senderName: 'Contraloría Interna',
          senderAgency: 'Órgano Interno de Control',
          subject: 'Requerimiento de expediente de contratación pública',
          description: 'Revisión documental de procedimiento de contratación directa.',
          priority: OficioPriority.URGENTE,
          dueAt: this.addDays(now, -2),
          responsibleAreaId: contraloria.id,
          status: OficioStatus.VENCIDO,
        },
        {
          folio: 'GD-2026-000003',
          externalNumber: 'DS/078/2026',
          receivedAt: this.addDays(now, -3),
          senderName: 'Comité Vecinal Colonia Centro',
          senderAgency: 'Participación Ciudadana',
          subject: 'Solicitud de apoyo para jornada comunitaria',
          description: 'Petición de apoyo logístico para jornada de limpieza y mantenimiento urbano.',
          priority: OficioPriority.MEDIA,
          dueAt: this.addDays(now, 10),
          responsibleAreaId: desarrollo.id,
          status: OficioStatus.TURNADO,
        },
        {
          folio: 'GD-2026-000004',
          externalNumber: 'JUR/021/2026',
          receivedAt: this.addDays(now, -20),
          senderName: 'Juzgado Primero Administrativo',
          senderAgency: 'Poder Judicial del Estado',
          subject: 'Notificación de requerimiento jurídico',
          description: 'Atención a requerimiento documental dentro de plazo legal.',
          priority: OficioPriority.ALTA,
          dueAt: this.addDays(now, -5),
          responsibleAreaId: juridico.id,
          status: OficioStatus.CERRADO,
        },
        {
          folio: 'GD-2026-000005',
          externalNumber: 'TES/099/2026',
          receivedAt: this.addDays(now, -1),
          senderName: 'Tesorería Estatal',
          senderAgency: 'Secretaría de Finanzas',
          subject: 'Conciliación mensual de participaciones federales',
          description: 'Validación de saldos y comprobantes correspondientes al mes en curso.',
          priority: OficioPriority.MEDIA,
          dueAt: this.addDays(now, 7),
          responsibleAreaId: tesoreria.id,
          status: OficioStatus.RECIBIDO,
        },
      ];

      for (const item of oficios) {
        const oficio = await tx.oficio.create({
          data: {
            tenantId: createdTenant.id,
            createdById: admin.id,
            ...item,
            closedAt: item.status === OficioStatus.CERRADO ? this.addDays(now, -4) : undefined,
            closedById: item.status === OficioStatus.CERRADO ? admin.id : undefined,
          },
        });

        await tx.seguimiento.create({
          data: {
            tenantId: createdTenant.id,
            oficioId: oficio.id,
            userId: admin.id,
            comment: `Oficio de demostración registrado con estatus ${item.status}.`,
            statusTo: item.status,
          },
        });
      }

      return createdTenant;
    });

    await this.auditoria.log({
      tenantId: tenant.id,
      userId: user.sub,
      action: AuditAction.DEMO_DATA_CREATED,
      entity: 'Tenant',
      entityId: tenant.id,
      metadata: { slug: tenant.slug, scenario: 'municipio-demo-comercial' },
    });

    return {
      created: true,
      tenant,
      credentials: this.demoCredentials(),
      message: 'Municipio demo creado correctamente.',
    };
  }

  private demoCredentials() {
    return {
      admin: { email: 'admin.demo@gestionadoc.mx', password: 'Demo12345!' },
      captura: { email: 'captura.demo@gestionadoc.mx', password: 'Demo12345!' },
      obras: { email: 'obras.demo@gestionadoc.mx', password: 'Demo12345!' },
    };
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
