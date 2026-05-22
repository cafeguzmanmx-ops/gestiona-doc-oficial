import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard } from '../common/security/subscription.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { TenantsService } from './tenants.service';

@UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Roles(UserRole.ADMIN_MUNICIPAL, UserRole.DIRECTOR_AREA, UserRole.CAPTURISTA, UserRole.CONSULTA)
  @Get('current')
  current(@CurrentUser() user: JwtUser) {
    return this.tenantsService.current(user);
  }
}
