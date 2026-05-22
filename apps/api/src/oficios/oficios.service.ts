import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArchivoTipo, AuditAction, OficioStatus, UserRole } from '@prisma/client';
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, unlinkSync } from 'fs';
import { dirname, extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtUser } from '../auth/types';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CloseOficioDto, CreateOficioDto, CreateSeguimientoDto, UpdateOficioStatusDto } from './dto';

type ListFilters = { status?: string; areaId?: string; search?: string };
type Uploaded = Express.Multer.File | undefined;

type DownloadPayload = {
  stream: NodeJS.ReadableStream;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
};

const OPEN_STATUSES: OficioStatus[] = [OficioStatus.RECIBIDO, OficioStatus.TURNADO, OficioStatus.EN_PROCESO];

@Injectable()
export class OficiosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async list(user: JwtUser, filters: ListFilters) {
    const tenantId = this.requireTenant(user);
    await this.markOverdue(tenantId);

    const areaId = this.resolveAreaFilter(user, filters.areaId);

    return this.prisma.oficio.findMany({
      where: {
        tenantId,
        status: this.parseStatus(filters.status),
        responsibleAreaId: areaId,
        AND: [
          this.oficioAccessFilter(user),
          filters.search ? {
            OR: [
              { folio: { contains: filters.search, mode: 'insensitive' } },
              { externalNumber: { contains: filters.search, mode: 'insensitive' } },
              { senderName: { contains: filters.search, mode: 'insensitive' } },
              { senderAgency: { contains: filters.search, mode: 'insensitive' } },
              { subject: { contains: filters.search, mode: 'insensitive' } },
            ],
          } : {},
        ],
      },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        folio: true,
        externalNumber: true,
        receivedAt: true,
        senderName: true,
        senderAgency: true,
        subject: true,
        priority: true,
        dueAt: true,
        status: true,
        createdAt: true,
        responsibleArea: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
        _count: { select: { archivos: true, seguimientos: true } },
      },
    });
  }

  async dashboard(user: JwtUser) {
    const tenantId = this.requireTenant(user);
    await this.markOverdue(tenantId);

    const now = new Date();
    const nextSevenDays = new Date(now);
    nextSevenDays.setDate(nextSevenDays.getDate() + 7);
    const accessFilter = this.oficioAccessFilter(user);

    const [total, pendientes, vencidos, cerrados, atendidos, proximos, byStatus, byPriority, byArea, recent] = await Promise.all([
      this.prisma.oficio.count({ where: { tenantId, AND: [accessFilter] } }),
      this.prisma.oficio.count({ where: { tenantId, status: { in: OPEN_STATUSES }, AND: [accessFilter] } }),
      this.prisma.oficio.count({ where: { tenantId, status: OficioStatus.VENCIDO, AND: [accessFilter] } }),
      this.prisma.oficio.count({ where: { tenantId, status: OficioStatus.CERRADO, AND: [accessFilter] } }),
      this.prisma.oficio.count({ where: { tenantId, status: OficioStatus.ATENDIDO, AND: [accessFilter] } }),
      this.prisma.oficio.count({ where: { tenantId, status: { in: OPEN_STATUSES }, dueAt: { gte: now, lte: nextSevenDays }, AND: [accessFilter] } }),
      this.prisma.oficio.groupBy({ by: ['status'], where: { tenantId, AND: [accessFilter] }, _count: { status: true } }),
      this.prisma.oficio.groupBy({ by: ['priority'], where: { tenantId, AND: [accessFilter] }, _count: { priority: true } }),
      this.prisma.oficio.groupBy({ by: ['responsibleAreaId'], where: { tenantId, AND: [accessFilter] }, _count: { _all: true } }),
      this.prisma.oficio.findMany({
        where: { tenantId, AND: [accessFilter] },
        orderBy: [{ createdAt: 'desc' }],
        take: 8,
        select: { id: true, folio: true, subject: true, status: true, priority: true, dueAt: true, responsibleArea: { select: { id: true, name: true } } },
      }),
    ]);

    const areaIds = byArea.map((item) => item.responsibleAreaId).filter(Boolean) as string[];
    const areas = areaIds.length
      ? await this.prisma.area.findMany({ where: { tenantId, id: { in: areaIds } }, select: { id: true, name: true } })
      : [];
    const areaMap = new Map(areas.map((area) => [area.id, area.name]));

    return {
      total,
      pendientes,
      vencidos,
      cerrados,
      atendidos,
      proximos,
      byStatus: byStatus.map((item) => ({ status: item.status, count: item._count.status })),
      byPriority: byPriority.map((item) => ({ priority: item.priority, count: item._count.priority })),
      byArea: byArea.map((item) => ({ areaId: item.responsibleAreaId, areaName: item.responsibleAreaId ? areaMap.get(item.responsibleAreaId) ?? 'Área no encontrada' : 'Sin turnar', count: item._count._all })),
      recent,
    };
  }

  async detail(user: JwtUser, id: string) {
    const tenantId = this.requireTenant(user);
    await this.markOverdue(tenantId);

    const oficio = await this.prisma.oficio.findFirst({
      where: { id, tenantId, AND: [this.oficioAccessFilter(user)] },
      include: {
        responsibleArea: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
        closedBy: { select: { id: true, fullName: true, email: true } },
        archivos: { orderBy: { createdAt: 'desc' }, include: { uploadedBy: { select: { id: true, fullName: true } } } },
        seguimientos: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, fullName: true } }, archivos: true },
        },
      },
    });
    if (!oficio) throw new NotFoundException('Oficio no encontrado');
    return oficio;
  }

  async create(user: JwtUser, dto: CreateOficioDto, file: Uploaded) {
    const tenantId = this.requireTenant(user);
    const responsibleAreaId = this.resolveResponsibleArea(user, dto.responsibleAreaId);
    await this.validateArea(tenantId, responsibleAreaId);
    this.validateDateRange(dto.receivedAt, dto.dueAt);
    this.validateFile(file);

    const folio = await this.generateFolio(tenantId);
    const status = responsibleAreaId ? OficioStatus.TURNADO : OficioStatus.RECIBIDO;

    const oficio = await this.prisma.$transaction(async (tx) => {
      const created = await tx.oficio.create({
        data: {
          tenantId,
          folio,
          externalNumber: dto.externalNumber?.trim(),
          receivedAt: new Date(dto.receivedAt),
          senderName: dto.senderName.trim(),
          senderAgency: dto.senderAgency?.trim(),
          subject: dto.subject.trim(),
          description: dto.description?.trim(),
          priority: dto.priority,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
          responsibleAreaId,
          status,
          createdById: user.sub,
        },
      });

      await tx.seguimiento.create({
        data: {
          tenantId,
          oficioId: created.id,
          userId: user.sub,
          comment: status === OficioStatus.TURNADO ? 'Oficio registrado y turnado al área responsable.' : 'Oficio registrado en bandeja de entrada.',
          statusTo: status,
        },
      });

      if (file) {
        const stored = this.moveFileToTenantPath(tenantId, created.id, file, ArchivoTipo.OFICIO_RECIBIDO);
        await tx.archivo.create({
          data: {
            tenantId,
            oficioId: created.id,
            uploadedById: user.sub,
            tipo: ArchivoTipo.OFICIO_RECIBIDO,
            fileName: stored.fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            path: stored.path,
          },
        });
      }

      return created;
    });

    await this.auditoria.logUserAction(user, AuditAction.OFICIO_CREATED, 'Oficio', oficio.id, { folio: oficio.folio, status: oficio.status, responsibleAreaId: oficio.responsibleAreaId });

    if (oficio.responsibleAreaId) {
      await this.notifications.notifyOficioAssigned({
        tenantId,
        oficioId: oficio.id,
        folio: oficio.folio,
        subject: oficio.subject,
        responsibleAreaId: oficio.responsibleAreaId,
      });
    }

    return this.detail(user, oficio.id);
  }

  async addSeguimiento(user: JwtUser, id: string, dto: CreateSeguimientoDto, file: Uploaded) {
    const tenantId = this.requireTenant(user);
    this.validateFile(file);
    const oficio = await this.prisma.oficio.findFirst({ where: { id, tenantId, AND: [this.oficioAccessFilter(user)] } });
    if (!oficio) throw new NotFoundException('Oficio no encontrado');
    if (oficio.status === OficioStatus.CERRADO) throw new BadRequestException('No se pueden agregar avances a un oficio cerrado');

    const nextStatus = dto.statusTo ?? oficio.status;
    if (nextStatus === OficioStatus.CERRADO) throw new BadRequestException('Usa la acción de cierre para cerrar el oficio');

    const seguimiento = await this.prisma.$transaction(async (tx) => {
      const created = await tx.seguimiento.create({
        data: {
          tenantId,
          oficioId: id,
          userId: user.sub,
          comment: dto.comment.trim(),
          statusFrom: oficio.status,
          statusTo: nextStatus !== oficio.status ? nextStatus : undefined,
        },
      });

      if (nextStatus !== oficio.status) {
        await tx.oficio.update({ where: { id }, data: { status: nextStatus } });
      }

      if (file) {
        const stored = this.moveFileToTenantPath(tenantId, id, file, ArchivoTipo.SEGUIMIENTO);
        await tx.archivo.create({
          data: {
            tenantId,
            oficioId: id,
            seguimientoId: created.id,
            uploadedById: user.sub,
            tipo: ArchivoTipo.SEGUIMIENTO,
            fileName: stored.fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            path: stored.path,
          },
        });
      }

      return created;
    });

    await this.auditoria.logUserAction(user, AuditAction.SEGUIMIENTO_CREATED, 'Seguimiento', seguimiento.id, { oficioId: seguimiento.oficioId, statusTo: dto.statusTo });

    return this.detail(user, seguimiento.oficioId);
  }

  async close(user: JwtUser, id: string, dto: CloseOficioDto, file: Uploaded) {
    const tenantId = this.requireTenant(user);
    this.validateFile(file);
    const oficio = await this.prisma.oficio.findFirst({ where: { id, tenantId, AND: [this.oficioAccessFilter(user)] } });
    if (!oficio) throw new NotFoundException('Oficio no encontrado');
    this.ensureCanModifyOficio(user, oficio.responsibleAreaId);
    if (oficio.status === OficioStatus.CERRADO) throw new BadRequestException('El oficio ya se encuentra cerrado');

    const updated = await this.prisma.$transaction(async (tx) => {
      const seguimiento = await tx.seguimiento.create({
        data: {
          tenantId,
          oficioId: id,
          userId: user.sub,
          comment: dto.comment.trim(),
          statusFrom: oficio.status,
          statusTo: OficioStatus.CERRADO,
        },
      });

      if (file) {
        const stored = this.moveFileToTenantPath(tenantId, id, file, ArchivoTipo.RESPUESTA);
        await tx.archivo.create({
          data: {
            tenantId,
            oficioId: id,
            seguimientoId: seguimiento.id,
            uploadedById: user.sub,
            tipo: ArchivoTipo.RESPUESTA,
            fileName: stored.fileName,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            path: stored.path,
          },
        });
      }

      return tx.oficio.update({
        where: { id },
        data: { status: OficioStatus.CERRADO, closedAt: new Date(), closedById: user.sub },
      });
    });

    await this.auditoria.logUserAction(user, AuditAction.OFICIO_CLOSED, 'Oficio', updated.id, { folio: updated.folio, previousStatus: oficio.status });

    await this.notifications.notifyOficioClosed({
      tenantId,
      oficioId: updated.id,
      folio: updated.folio,
      subject: updated.subject,
      responsibleAreaId: updated.responsibleAreaId,
    });

    return this.detail(user, updated.id);
  }

  async updateStatus(user: JwtUser, id: string, dto: UpdateOficioStatusDto) {
    const tenantId = this.requireTenant(user);
    const oficio = await this.prisma.oficio.findFirst({ where: { id, tenantId, AND: [this.oficioAccessFilter(user)] } });
    if (!oficio) throw new NotFoundException('Oficio no encontrado');
    this.ensureCanModifyOficio(user, oficio.responsibleAreaId);
    if (oficio.status === OficioStatus.CERRADO) throw new BadRequestException('El oficio ya está cerrado');

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.oficio.update({
        where: { id },
        data: {
          status: dto.status,
          closedAt: dto.status === OficioStatus.CERRADO ? new Date() : undefined,
          closedById: dto.status === OficioStatus.CERRADO ? user.sub : undefined,
        },
      });

      await tx.seguimiento.create({
        data: {
          tenantId,
          oficioId: id,
          userId: user.sub,
          comment: dto.comment.trim(),
          statusFrom: oficio.status,
          statusTo: dto.status,
        },
      });

      return result;
    });

    await this.auditoria.logUserAction(user, AuditAction.OFICIO_STATUS_CHANGED, 'Oficio', updated.id, { folio: updated.folio, previousStatus: oficio.status, nextStatus: dto.status });

    return this.detail(user, updated.id);
  }

  async downloadArchivo(user: JwtUser, archivoId: string): Promise<DownloadPayload> {
    const tenantId = this.requireTenant(user);
    const archivo = await this.prisma.archivo.findFirst({
      where: { id: archivoId, tenantId },
      include: { oficio: { select: { id: true, responsibleAreaId: true, createdById: true, folio: true } } },
    });
    if (!archivo) throw new NotFoundException('Archivo no encontrado');
    if (archivo.oficio) this.ensureCanViewOficio(user, archivo.oficio.responsibleAreaId, archivo.oficio.createdById);
    if (!existsSync(archivo.path)) throw new NotFoundException('El archivo físico no está disponible en el almacenamiento');

    await this.auditoria.logUserAction(user, AuditAction.OFICIO_FILE_DOWNLOADED, 'Archivo', archivo.id, { oficioId: archivo.oficioId, folio: archivo.oficio?.folio, originalName: archivo.originalName });

    return {
      stream: createReadStream(archivo.path),
      originalName: archivo.originalName,
      mimeType: archivo.mimeType,
      sizeBytes: archivo.sizeBytes,
    };
  }

  private requireTenant(user: JwtUser) {
    if (!user.tenantId) throw new ForbiddenException('Usuario sin municipio asignado');
    return user.tenantId;
  }

  private tenantWideAccess(user: JwtUser) {
    return user.role === UserRole.ADMIN_MUNICIPAL || user.role === UserRole.CAPTURISTA;
  }

  private oficioAccessFilter(user: JwtUser) {
    if (this.tenantWideAccess(user)) return {};
    if (user.areaId) {
      return { OR: [{ responsibleAreaId: user.areaId }, { createdById: user.sub }] };
    }
    return { createdById: user.sub };
  }

  private resolveAreaFilter(user: JwtUser, requestedAreaId?: string) {
    if (!requestedAreaId) return undefined;
    if (!this.tenantWideAccess(user) && requestedAreaId !== user.areaId) {
      throw new ForbiddenException('No tienes permiso para consultar oficios de otra área');
    }
    return requestedAreaId;
  }

  private resolveResponsibleArea(user: JwtUser, requestedAreaId?: string) {
    if (this.tenantWideAccess(user)) return requestedAreaId;
    if (!user.areaId) throw new ForbiddenException('Usuario sin área asignada');
    if (requestedAreaId && requestedAreaId !== user.areaId) {
      throw new ForbiddenException('No puedes turnar oficios a un área distinta a la tuya');
    }
    return user.areaId;
  }

  private ensureCanViewOficio(user: JwtUser, responsibleAreaId?: string | null, createdById?: string | null) {
    if (this.tenantWideAccess(user)) return;
    if (responsibleAreaId && user.areaId === responsibleAreaId) return;
    if (createdById && user.sub === createdById) return;
    throw new ForbiddenException('No tienes permiso para consultar este oficio');
  }

  private ensureCanModifyOficio(user: JwtUser, responsibleAreaId?: string | null) {
    if (user.role === UserRole.ADMIN_MUNICIPAL) return;
    if (user.role === UserRole.DIRECTOR_AREA && responsibleAreaId && user.areaId === responsibleAreaId) return;
    throw new ForbiddenException('No tienes permiso para modificar este oficio');
  }


  private parseStatus(status?: string) {
    if (!status) return undefined;
    if (!Object.values(OficioStatus).includes(status as OficioStatus)) {
      throw new BadRequestException('Estatus no válido');
    }
    return status as OficioStatus;
  }

  private async validateArea(tenantId: string, areaId?: string) {
    if (!areaId) return;
    const area = await this.prisma.area.findFirst({ where: { id: areaId, tenantId, active: true } });
    if (!area) throw new BadRequestException('Área responsable no válida');
  }

  private validateDateRange(receivedAt: string, dueAt?: string) {
    const received = new Date(receivedAt);
    if (Number.isNaN(received.getTime())) throw new BadRequestException('Fecha de recepción inválida');

    if (dueAt) {
      const due = new Date(dueAt);
      if (Number.isNaN(due.getTime())) throw new BadRequestException('Fecha límite inválida');
      if (due < received) throw new BadRequestException('La fecha límite no puede ser anterior a la fecha de recepción');
    }
  }

  private validateFile(file: Uploaded) {
    if (!file) return;
    try {
      const ext = extname(file.originalname).toLowerCase();
      const maxMb = Number(this.config.get<string>('MAX_UPLOAD_MB') ?? '10');
      const maxBytes = Math.max(1, maxMb) * 1024 * 1024;

      if (file.mimetype !== 'application/pdf' || ext !== '.pdf') {
        throw new BadRequestException('Solo se permiten archivos PDF con extensión .pdf');
      }
      if (file.size > maxBytes) {
        throw new BadRequestException(`El PDF no debe exceder ${maxMb} MB`);
      }

      const signature = readFileSync(file.path, { encoding: 'utf8', flag: 'r' }).slice(0, 5);
      if (signature !== '%PDF-') {
        throw new BadRequestException('El archivo no parece ser un PDF válido');
      }
    } catch (error) {
      this.deleteTempFile(file);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('No se pudo validar el archivo PDF');
    }
  }

  private deleteTempFile(file: Express.Multer.File) {
    try {
      if (file.path && existsSync(file.path)) unlinkSync(file.path);
    } catch {
      // No bloqueamos el flujo por fallas de limpieza temporal.
    }
  }

  private async generateFolio(tenantId: string) {
    const year = new Date().getFullYear();
    const startsWith = `GD-${year}-`;
    const count = await this.prisma.oficio.count({ where: { tenantId, folio: { startsWith } } });
    return `${startsWith}${String(count + 1).padStart(6, '0')}`;
  }

  private moveFileToTenantPath(tenantId: string, oficioId: string, file: Express.Multer.File, tipo: ArchivoTipo) {
    const uploadsDir = this.config.get<string>('UPLOADS_DIR') ?? './uploads';
    const ext = extname(file.originalname).toLowerCase() || '.pdf';
    const safeTipo = tipo.toLowerCase();
    const fileName = `${randomUUID()}-${safeTipo}-${oficioId}${ext}`;
    const finalPath = join(uploadsDir, tenantId, 'oficios', oficioId, fileName);
    mkdirSync(dirname(finalPath), { recursive: true });
    renameSync(file.path, finalPath);
    return { fileName, path: finalPath };
  }

  private async markOverdue(tenantId: string) {
    await this.prisma.oficio.updateMany({
      where: {
        tenantId,
        status: { in: OPEN_STATUSES },
        dueAt: { lt: new Date() },
      },
      data: { status: OficioStatus.VENCIDO },
    });
  }
}
