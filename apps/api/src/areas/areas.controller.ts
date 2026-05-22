import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard } from '../common/security/subscription.guard';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto } from './dto';

@UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  list(@CurrentUser() user: JwtUser) {
    return this.areasService.list(user);
  }

  @Roles(UserRole.ADMIN_MUNICIPAL)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateAreaDto) {
    return this.areasService.create(user, dto);
  }

  @Roles(UserRole.ADMIN_MUNICIPAL)
  @Patch(':id')
  update(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateAreaDto) {
    return this.areasService.update(user, id, dto);
  }

  @Roles(UserRole.ADMIN_MUNICIPAL)
  @Delete(':id')
  deactivate(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.areasService.deactivate(user, id);
  }
}
