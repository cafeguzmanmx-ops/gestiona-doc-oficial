import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard } from '../common/security/subscription.guard';
import { ReportesService } from './reportes.service';

@UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('oficios')
  oficiosData(
    @CurrentUser() user: JwtUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('areaId') areaId?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    return this.reportesService.oficiosData(user, { from, to, status, areaId, priority, search });
  }

  @Get('oficios/excel')
  async oficiosExcel(
    @CurrentUser() user: JwtUser,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('areaId') areaId?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    const buffer = await this.reportesService.oficiosExcel(user, { from, to, status, areaId, priority, search });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-oficios-${new Date().toISOString().slice(0, 10)}.xlsx"`);
    res.send(buffer);
  }

  @Get('oficios/pdf')
  async oficiosPdf(
    @CurrentUser() user: JwtUser,
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('areaId') areaId?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    const buffer = await this.reportesService.oficiosPdf(user, { from, to, status, areaId, priority, search });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-oficios-${new Date().toISOString().slice(0, 10)}.pdf"`);
    res.send(buffer);
  }
}
