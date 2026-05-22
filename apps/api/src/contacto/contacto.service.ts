import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, DemoRequestStatus } from '@prisma/client';
import { JwtUser } from '../auth/types';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { PrismaService } from '../database/prisma.service';
import { CreateDemoRequestDto, UpdateDemoRequestDto } from './dto';

export type RequestMeta = {
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class ContactoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async createDemoRequest(dto: CreateDemoRequestDto, meta: RequestMeta = {}) {
    const request = await this.prisma.demoRequest.create({
      data: {
        municipioName: dto.municipioName.trim(),
        state: dto.state.trim(),
        contactName: dto.contactName.trim(),
        position: dto.position?.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim(),
        estimatedUsers: dto.estimatedUsers,
        message: dto.message?.trim(),
        source: dto.source?.trim() ?? 'landing',
      },
    });

    await this.auditoria.log({
      action: AuditAction.DEMO_REQUEST_CREATED,
      entity: 'DemoRequest',
      entityId: request.id,
      metadata: {
        municipioName: request.municipioName,
        state: request.state,
        email: request.email,
        source: request.source,
      },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      id: request.id,
      message: 'Solicitud recibida. El equipo de Gestiona Doc dará seguimiento a la demo.',
    };
  }

  async listDemoRequests(status?: DemoRequestStatus) {
    if (status && !Object.values(DemoRequestStatus).includes(status)) {
      throw new BadRequestException('Estatus de solicitud de demo inválido');
    }
    return this.prisma.demoRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 250,
    });
  }

  async updateDemoRequest(user: JwtUser, id: string, dto: UpdateDemoRequestDto) {
    const current = await this.prisma.demoRequest.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Solicitud de demo no encontrada');

    const updated = await this.prisma.demoRequest.update({
      where: { id },
      data: {
        status: dto.status ?? current.status,
        notes: dto.notes ?? current.notes,
      },
    });

    await this.auditoria.log({
      userId: user.sub,
      action: AuditAction.DEMO_REQUEST_UPDATED,
      entity: 'DemoRequest',
      entityId: id,
      metadata: {
        previousStatus: current.status,
        status: updated.status,
        notesUpdated: dto.notes !== undefined,
      },
    });

    return updated;
  }
}
