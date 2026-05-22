import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument = require('pdfkit');
import { OficioPriority, OficioStatus, UserRole } from '@prisma/client';
import { JwtUser } from '../auth/types';
import { PrismaService } from '../database/prisma.service';

type ReportFilters = {
  from?: string;
  to?: string;
  status?: string;
  areaId?: string;
  priority?: string;
  search?: string;
};

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async oficiosData(user: JwtUser, filters: ReportFilters) {
    const tenantId = this.requireTenant(user);
    const where = this.buildWhere(user, tenantId, filters);

    const [tenant, oficios] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true, state: true } }),
      this.prisma.oficio.findMany({
        where,
        orderBy: [{ receivedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          responsibleArea: { select: { id: true, name: true } },
          createdBy: { select: { id: true, fullName: true } },
          closedBy: { select: { id: true, fullName: true } },
          _count: { select: { archivos: true, seguimientos: true } },
        },
      }),
    ]);

    const summary = {
      total: oficios.length,
      recibidos: oficios.filter((item) => item.status === 'RECIBIDO').length,
      turnados: oficios.filter((item) => item.status === 'TURNADO').length,
      enProceso: oficios.filter((item) => item.status === 'EN_PROCESO').length,
      atendidos: oficios.filter((item) => item.status === 'ATENDIDO').length,
      cerrados: oficios.filter((item) => item.status === 'CERRADO').length,
      vencidos: oficios.filter((item) => item.status === 'VENCIDO').length,
    };

    return { tenant, filters, summary, oficios };
  }

  async oficiosExcel(user: JwtUser, filters: ReportFilters) {
    const report = await this.oficiosData(user, filters);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Gestiona Doc';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Oficios');
    sheet.columns = [
      { header: 'Folio', key: 'folio', width: 18 },
      { header: 'No. oficio externo', key: 'externalNumber', width: 22 },
      { header: 'Fecha recepción', key: 'receivedAt', width: 18 },
      { header: 'Remitente', key: 'senderName', width: 28 },
      { header: 'Dependencia', key: 'senderAgency', width: 28 },
      { header: 'Asunto', key: 'subject', width: 44 },
      { header: 'Prioridad', key: 'priority', width: 14 },
      { header: 'Estatus', key: 'status', width: 16 },
      { header: 'Fecha límite', key: 'dueAt', width: 18 },
      { header: 'Área responsable', key: 'area', width: 28 },
      { header: 'Creado por', key: 'createdBy', width: 26 },
      { header: 'Cerrado por', key: 'closedBy', width: 26 },
      { header: 'Fecha cierre', key: 'closedAt', width: 18 },
      { header: 'Seguimientos', key: 'seguimientos', width: 14 },
      { header: 'Archivos', key: 'archivos', width: 12 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: 'middle' };

    report.oficios.forEach((oficio) => {
      sheet.addRow({
        folio: oficio.folio,
        externalNumber: oficio.externalNumber ?? '',
        receivedAt: this.formatDate(oficio.receivedAt),
        senderName: oficio.senderName,
        senderAgency: oficio.senderAgency ?? '',
        subject: oficio.subject,
        priority: oficio.priority,
        status: oficio.status,
        dueAt: oficio.dueAt ? this.formatDate(oficio.dueAt) : '',
        area: oficio.responsibleArea?.name ?? 'Sin turnar',
        createdBy: oficio.createdBy.fullName,
        closedBy: oficio.closedBy?.fullName ?? '',
        closedAt: oficio.closedAt ? this.formatDate(oficio.closedAt) : '',
        seguimientos: oficio._count.seguimientos,
        archivos: oficio._count.archivos,
      });
    });

    const summary = workbook.addWorksheet('Resumen');
    summary.columns = [{ header: 'Indicador', key: 'label', width: 24 }, { header: 'Valor', key: 'value', width: 16 }];
    summary.addRows([
      { label: 'Municipio', value: report.tenant?.name ?? '' },
      { label: 'Estado', value: report.tenant?.state ?? '' },
      { label: 'Total', value: report.summary.total },
      { label: 'Recibidos', value: report.summary.recibidos },
      { label: 'Turnados', value: report.summary.turnados },
      { label: 'En proceso', value: report.summary.enProceso },
      { label: 'Atendidos', value: report.summary.atendidos },
      { label: 'Cerrados', value: report.summary.cerrados },
      { label: 'Vencidos', value: report.summary.vencidos },
    ]);
    summary.getRow(1).font = { bold: true };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async oficiosPdf(user: JwtUser, filters: ReportFilters) {
    const report = await this.oficiosData(user, filters);
    const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Gestiona Doc', { align: 'left' });
      doc.fontSize(13).text('Reporte de oficios municipales', { align: 'left' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Municipio: ${report.tenant?.name ?? ''}, ${report.tenant?.state ?? ''}`);
      doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`);
      doc.moveDown();

      doc.fontSize(11).text(`Total: ${report.summary.total} | Pendientes: ${report.summary.recibidos + report.summary.turnados + report.summary.enProceso} | Cerrados: ${report.summary.cerrados} | Vencidos: ${report.summary.vencidos}`);
      doc.moveDown();

      report.oficios.slice(0, 80).forEach((oficio, index) => {
        if (doc.y > 700) doc.addPage();
        doc.fontSize(10).font('Helvetica-Bold').text(`${index + 1}. ${oficio.folio} · ${oficio.status} · ${oficio.priority}`);
        doc.font('Helvetica').text(`Asunto: ${oficio.subject}`);
        doc.text(`Remitente: ${oficio.senderName}${oficio.senderAgency ? ` / ${oficio.senderAgency}` : ''}`);
        doc.text(`Área: ${oficio.responsibleArea?.name ?? 'Sin turnar'} | Recepción: ${this.formatDate(oficio.receivedAt)} | Límite: ${oficio.dueAt ? this.formatDate(oficio.dueAt) : 'Sin plazo'}`);
        doc.moveDown(0.6);
      });

      if (report.oficios.length > 80) {
        doc.moveDown();
        doc.fontSize(9).text(`Nota: el PDF muestra los primeros 80 registros. Para el detalle completo usa la exportación Excel.`);
      }

      doc.end();
    });
  }

  private requireTenant(user: JwtUser) {
    if (!user.tenantId) throw new ForbiddenException('Usuario sin municipio asignado');
    return user.tenantId;
  }

  private buildWhere(user: JwtUser, tenantId: string, filters: ReportFilters) {
    const receivedAt: { gte?: Date; lte?: Date } = {};
    if (filters.from) receivedAt.gte = this.parseDateFilter(filters.from, 'Fecha inicial inválida');
    if (filters.to) {
      const end = this.parseDateFilter(filters.to, 'Fecha final inválida');
      end.setHours(23, 59, 59, 999);
      receivedAt.lte = end;
    }
    if (receivedAt.gte && receivedAt.lte && receivedAt.gte > receivedAt.lte) {
      throw new BadRequestException('La fecha inicial no puede ser posterior a la fecha final');
    }

    const areaId = this.resolveAreaFilter(user, filters.areaId);

    return {
      tenantId,
      status: this.parseStatus(filters.status),
      priority: this.parsePriority(filters.priority),
      responsibleAreaId: areaId,
      receivedAt: Object.keys(receivedAt).length ? receivedAt : undefined,
      AND: [
        this.oficioAccessFilter(user),
        filters.search ? {
          OR: [
            { folio: { contains: filters.search, mode: 'insensitive' as const } },
            { externalNumber: { contains: filters.search, mode: 'insensitive' as const } },
            { senderName: { contains: filters.search, mode: 'insensitive' as const } },
            { senderAgency: { contains: filters.search, mode: 'insensitive' as const } },
            { subject: { contains: filters.search, mode: 'insensitive' as const } },
          ],
        } : {},
      ],
    };
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
      throw new ForbiddenException('No tienes permiso para reportar oficios de otra área');
    }
    return requestedAreaId;
  }

  private parseDateFilter(value: string, message: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new BadRequestException(message);
    return parsed;
  }

  private parseStatus(status?: string) {
    if (!status) return undefined;
    if (!Object.values(OficioStatus).includes(status as OficioStatus)) throw new BadRequestException('Estatus no válido');
    return status as OficioStatus;
  }

  private parsePriority(priority?: string) {
    if (!priority) return undefined;
    if (!Object.values(OficioPriority).includes(priority as OficioPriority)) throw new BadRequestException('Prioridad no válida');
    return priority as OficioPriority;
  }

  private formatDate(value: Date) {
    return value.toISOString().slice(0, 10);
  }
}

