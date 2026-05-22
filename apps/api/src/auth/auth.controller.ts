import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { BootstrapSuperAdminDto, LoginDto, RegisterMunicipioDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-municipio')
  registerMunicipio(@Body() dto: RegisterMunicipioDto, @Req() req: Request) {
    return this.authService.registerMunicipio(dto, this.getRequestMeta(req));
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.getRequestMeta(req));
  }

  @Post('bootstrap-super-admin')
  bootstrapSuperAdmin(@Body() dto: BootstrapSuperAdminDto, @Req() req: Request) {
    return this.authService.bootstrapSuperAdmin(dto, this.getRequestMeta(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.sub);
  }

  private getRequestMeta(req: Request) {
    const requestLike = req as unknown as { ip?: string; headers?: Record<string, string | string[] | undefined> };
    const userAgent = requestLike.headers?.['user-agent'];
    return {
      ip: requestLike.ip,
      userAgent: Array.isArray(userAgent) ? userAgent.join(' ') : userAgent,
    };
  }
}
