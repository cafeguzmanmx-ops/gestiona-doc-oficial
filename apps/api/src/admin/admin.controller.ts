import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateSubscriptionDto } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('municipios')
  listMunicipios() {
    return this.adminService.listMunicipios();
  }

  @Get('municipios/:id')
  municipioDetail(@Param('id') id: string) {
    return this.adminService.municipioDetail(id);
  }

  @Patch('municipios/:id/suscripcion')
  updateSubscription(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.adminService.updateSubscription(user, id, dto);
  }
}
