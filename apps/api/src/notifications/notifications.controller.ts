import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionGuard } from '../common/security/subscription.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('notificaciones')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: JwtUser, @Query('unreadOnly') unreadOnly?: string) {
    return this.notificationsService.list(user, unreadOnly === 'true');
  }

  @Get('resumen')
  summary(@CurrentUser() user: JwtUser) {
    return this.notificationsService.summary(user);
  }

  @Patch(':id/leida')
  markAsRead(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user, id);
  }

  @Patch('marcar-todas-leidas')
  markAllAsRead(@CurrentUser() user: JwtUser) {
    return this.notificationsService.markAllAsRead(user);
  }
}
