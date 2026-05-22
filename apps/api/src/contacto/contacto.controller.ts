import { Body, Controller, Get, Patch, Post, Query, Param, Req, UseGuards } from '@nestjs/common';
import { DemoRequestStatus, UserRole } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ContactoService } from './contacto.service';
import { CreateDemoRequestDto, UpdateDemoRequestDto } from './dto';

@Controller('contacto')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post('solicitar-demo')
  createDemoRequest(@Body() dto: CreateDemoRequestDto, @Req() req: Request) {
    return this.contactoService.createDemoRequest(dto, {
      ip: req.ip,
      userAgent: Array.isArray(req.headers['user-agent']) ? req.headers['user-agent'].join(', ') : req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('solicitudes-demo')
  listDemoRequests(@Query('status') status?: DemoRequestStatus) {
    return this.contactoService.listDemoRequests(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('solicitudes-demo/:id')
  updateDemoRequest(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateDemoRequestDto) {
    return this.contactoService.updateDemoRequest(user, id, dto);
  }
}
