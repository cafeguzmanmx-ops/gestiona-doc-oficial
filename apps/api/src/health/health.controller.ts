import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  health() {
    return {
      status: 'ok',
      service: 'gestiona-doc-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    const checks = {
      database: await this.checkDatabase(),
      storage: this.checkStorage(),
    };
    const ok = Object.values(checks).every((check) => check.status === 'ok');

    return {
      status: ok ? 'ready' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error instanceof Error ? error.message : 'database check failed' };
    }
  }

  private checkStorage() {
    const uploadsDir = this.config.get<string>('UPLOADS_DIR') ?? './uploads';
    const probePath = join(uploadsDir, '.healthcheck');
    try {
      mkdirSync(uploadsDir, { recursive: true });
      writeFileSync(probePath, 'ok');
      rmSync(probePath, { force: true });
      return { status: 'ok', uploadsDir };
    } catch (error) {
      return { status: 'error', uploadsDir, message: error instanceof Error ? error.message : 'storage check failed' };
    }
  }
}
