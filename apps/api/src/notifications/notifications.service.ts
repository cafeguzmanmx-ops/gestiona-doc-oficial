import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, OficioStatus, Prisma, UserRole } from '@prisma/client';
import { JwtUser } from '../auth/types';
import { PrismaService } from '../database/prisma.service';

const OPEN_STATUSES: OficioStatus[] = [OficioStatus.RECIBIDO, OficioStatus.TURNADO, OficioStatus.EN_PROCESO, OficioStatus.VENCIDO];

type Recipient = { id: string };

type OficioNotificationPayload = {
  tenantId: string;
  oficioId: string;
  folio: string;
  subject: string;
  responsibleAreaId?: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: JwtUser, unreadOnly = false) {
    const tenantId = this.requireTenant(user);
    await this.generateDueAlerts(tenantId);

    return this.prisma.notification.findMany({
      where: {
        tenantId,
        userId: user.sub,
        readAt: unreadOnly ? null : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        oficio: { select: { id: true, folio: true, subject: true, status: true, dueAt: true } },
      },
    });
  }

  async summary(user: JwtUser) {
    const tenantId = this.requireTenant(user);
    await this.generateDueAlerts(tenantId);

    const [unread, recent] = await Promise.all([
      this.prisma.notification.count({ where: { tenantId, userId: user.sub, readAt: null } }),
      this.prisma.notification.findMany({
        where: { tenantId, userId: user.sub },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { oficio: { select: { id: true, folio: true, subject: true, status: true, dueAt: true } } },
      }),
    ]);

    return { unread, recent };
  }

  async markAsRead(user: JwtUser, id: string) {
    const tenantId = this.requireTenant(user);
    const notification = await this.prisma.notification.findFirst({ where: { id, tenantId, userId: user.sub } });
    if (!notification) throw new NotFoundException('Notificación no encontrada');

    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async markAllAsRead(user: JwtUser) {
    const tenantId = this.requireTenant(user);
    const result = await this.prisma.notification.updateMany({
      where: { tenantId, userId: user.sub, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async notifyOficioAssigned(payload: OficioNotificationPayload) {
    const recipients = await this.recipientsForOficio(payload.tenantId, payload.responsibleAreaId);
    await this.createForRecipients(recipients, {
      tenantId: payload.tenantId,
      oficioId: payload.oficioId,
      type: NotificationType.OFICIO_ASIGNADO,
      title: `Oficio asignado ${payload.folio}`,
      message: `Se asignó el oficio "${payload.subject}" para su atención.`,
      metadata: { folio: payload.folio },
    });
  }

  async notifyOficioClosed(payload: OficioNotificationPayload) {
    const recipients = await this.recipientsForOficio(payload.tenantId, payload.responsibleAreaId);
    await this.createForRecipients(recipients, {
      tenantId: payload.tenantId,
      oficioId: payload.oficioId,
      type: NotificationType.OFICIO_CERRADO,
      title: `Oficio cerrado ${payload.folio}`,
      message: `El oficio "${payload.subject}" fue cerrado documentalmente.`,
      metadata: { folio: payload.folio },
    });
  }

  async generateDueAlerts(tenantId: string) {
    const now = new Date();
    const inThreeDays = new Date(now);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const [overdue, dueSoon] = await Promise.all([
      this.prisma.oficio.findMany({
        where: { tenantId, status: { in: OPEN_STATUSES }, dueAt: { lt: now } },
        select: { id: true, folio: true, subject: true, dueAt: true, responsibleAreaId: true },
        take: 100,
      }),
      this.prisma.oficio.findMany({
        where: { tenantId, status: { in: [OficioStatus.RECIBIDO, OficioStatus.TURNADO, OficioStatus.EN_PROCESO] }, dueAt: { gte: now, lte: inThreeDays } },
        select: { id: true, folio: true, subject: true, dueAt: true, responsibleAreaId: true },
        take: 100,
      }),
    ]);

    for (const oficio of overdue) {
      const recipients = await this.recipientsForOficio(tenantId, oficio.responsibleAreaId);
      await this.createForRecipients(recipients, {
        tenantId,
        oficioId: oficio.id,
        type: NotificationType.OFICIO_VENCIDO,
        title: `Oficio vencido ${oficio.folio}`,
        message: `El oficio "${oficio.subject}" superó su fecha límite de atención.`,
        metadata: { folio: oficio.folio, dueAt: oficio.dueAt },
      });
    }

    for (const oficio of dueSoon) {
      const recipients = await this.recipientsForOficio(tenantId, oficio.responsibleAreaId);
      await this.createForRecipients(recipients, {
        tenantId,
        oficioId: oficio.id,
        type: NotificationType.OFICIO_PROXIMO_VENCER,
        title: `Oficio próximo a vencer ${oficio.folio}`,
        message: `El oficio "${oficio.subject}" vence dentro de los próximos 3 días.`,
        metadata: { folio: oficio.folio, dueAt: oficio.dueAt },
      });
    }
  }

  private async recipientsForOficio(tenantId: string, responsibleAreaId?: string | null): Promise<Recipient[]> {
    const orConditions: Prisma.UserWhereInput[] = [{ role: UserRole.ADMIN_MUNICIPAL }];
    if (responsibleAreaId) {
      orConditions.push({
        areaId: responsibleAreaId,
        role: { in: [UserRole.DIRECTOR_AREA, UserRole.CAPTURISTA] },
      });
    }

    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        active: true,
        OR: orConditions,
      },
      select: { id: true },
    });

    const unique = new Map(users.map((user) => [user.id, user]));
    return Array.from(unique.values());
  }

  private async createForRecipients(
    recipients: Recipient[],
    data: {
      tenantId: string;
      oficioId: string;
      type: NotificationType;
      title: string;
      message: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    await Promise.all(
      recipients.map((recipient) =>
        this.prisma.notification.upsert({
          where: {
            tenantId_userId_type_oficioId: {
              tenantId: data.tenantId,
              userId: recipient.id,
              type: data.type,
              oficioId: data.oficioId,
            },
          },
          create: {
            tenantId: data.tenantId,
            userId: recipient.id,
            oficioId: data.oficioId,
            type: data.type,
            title: data.title,
            message: data.message,
            metadata: data.metadata as any,
          },
          update: {
            title: data.title,
            message: data.message,
            metadata: data.metadata as any,
          },
        }),
      ),
    );
  }

  private requireTenant(user: JwtUser) {
    if (!user.tenantId) throw new ForbiddenException('Usuario sin municipio asignado');
    return user.tenantId;
  }
}
