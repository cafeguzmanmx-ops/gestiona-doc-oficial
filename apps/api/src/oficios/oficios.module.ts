import { Module } from '@nestjs/common';
import { SecurityModule } from '../common/security/security.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OficiosController } from './oficios.controller';
import { OficiosService } from './oficios.service';

@Module({
  imports: [NotificationsModule, SecurityModule, AuditoriaModule],
  controllers: [OficiosController],
  providers: [OficiosService],
})
export class OficiosModule {}
