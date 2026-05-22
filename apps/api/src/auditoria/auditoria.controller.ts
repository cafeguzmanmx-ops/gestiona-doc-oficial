import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard } from '../common/security/subscription.guard';
import { AuditoriaService } from './auditoria.service';

@UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_MUNICIPAL)
  @Get()
  list(
    @CurrentUser() user: JwtUser,
    @Query('tenantId') tenantId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditoriaService.listForUser(user, {
      tenantId,
      action: this.parseAction(action),
      entity,
      userId,
      from,
      to,
      limit: limit ? Number(limit) : undefined,
    });
  }

  private parseAction(action?: string) {
    if (!action) return undefined;
    if (!Object.values(AuditAction).includes(action as AuditAction)) {
      throw new BadRequestException('Acción de auditoría no válida');
    }
    return action as AuditAction;
  }
}
