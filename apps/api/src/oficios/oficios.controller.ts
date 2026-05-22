import { Body, Controller, Get, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtUser } from '../auth/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard } from '../common/security/subscription.guard';
import { getPdfUploadOptions } from '../common/upload/pdf-upload.options';
import { CloseOficioDto, CreateOficioDto, CreateSeguimientoDto, UpdateOficioStatusDto } from './dto';
import { OficiosService } from './oficios.service';

@UseGuards(JwtAuthGuard, SubscriptionGuard, RolesGuard)
@Controller('oficios')
export class OficiosController {
  constructor(private readonly oficiosService: OficiosService) {}

  @Get()
  list(
    @CurrentUser() user: JwtUser,
    @Query('status') status?: string,
    @Query('areaId') areaId?: string,
    @Query('search') search?: string,
  ) {
    return this.oficiosService.list(user, { status, areaId, search });
  }

  @Get('dashboard/resumen')
  dashboard(@CurrentUser() user: JwtUser) {
    return this.oficiosService.dashboard(user);
  }

  @Get('archivos/:archivoId/descargar')
  async downloadArchivo(@CurrentUser() user: JwtUser, @Param('archivoId') archivoId: string, @Res() res: Response) {
    const archivo = await this.oficiosService.downloadArchivo(user, archivoId);
    res.setHeader('Content-Type', archivo.mimeType);
    res.setHeader('Content-Length', String(archivo.sizeBytes));
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(archivo.originalName)}`);
    archivo.stream.pipe(res);
  }

  @Get(':id')
  detail(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.oficiosService.detail(user, id);
  }

  @Roles(UserRole.ADMIN_MUNICIPAL, UserRole.CAPTURISTA, UserRole.DIRECTOR_AREA)
  @Post()
  @UseInterceptors(FileInterceptor('archivo', getPdfUploadOptions() as any))
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateOficioDto, @UploadedFile() file?: Express.Multer.File) {
    return this.oficiosService.create(user, dto, file);
  }

  @Roles(UserRole.ADMIN_MUNICIPAL, UserRole.DIRECTOR_AREA, UserRole.CAPTURISTA)
  @Post(':id/seguimientos')
  @UseInterceptors(FileInterceptor('archivo', getPdfUploadOptions() as any))
  addSeguimiento(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: CreateSeguimientoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.oficiosService.addSeguimiento(user, id, dto, file);
  }

  @Roles(UserRole.ADMIN_MUNICIPAL, UserRole.DIRECTOR_AREA)
  @Post(':id/cerrar')
  @UseInterceptors(FileInterceptor('archivo', getPdfUploadOptions() as any))
  close(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: CloseOficioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.oficiosService.close(user, id, dto, file);
  }

  @Roles(UserRole.ADMIN_MUNICIPAL, UserRole.DIRECTOR_AREA)
  @Patch(':id/status')
  updateStatus(@CurrentUser() user: JwtUser, @Param('id') id: string, @Body() dto: UpdateOficioStatusDto) {
    return this.oficiosService.updateStatus(user, id, dto);
  }
}
