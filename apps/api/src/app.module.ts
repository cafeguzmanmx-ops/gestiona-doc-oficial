import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './common/config/env.validation';
import { AdminModule } from './admin/admin.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { ContactoModule } from './contacto/contacto.module';
import { AreasModule } from './areas/areas.module';
import { DatabaseModule } from './database/database.module';
import { DemoModule } from './demo/demo.module';
import { HealthModule } from './health/health.module';
import { OficiosModule } from './oficios/oficios.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportesModule } from './reportes/reportes.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    DatabaseModule,
    DemoModule,
    AdminModule,
    AuditoriaModule,
    ContactoModule,
    HealthModule,
    AuthModule,
    AreasModule,
    UsersModule,
    OficiosModule,
    ReportesModule,
    NotificationsModule,
    TenantsModule,
  ],
})
export class AppModule {}
