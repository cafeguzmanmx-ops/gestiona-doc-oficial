import { Module } from '@nestjs/common';
import { SecurityModule } from '../common/security/security.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { AreasController } from './areas.controller';
import { AreasService } from './areas.service';

@Module({
  imports: [SecurityModule, AuditoriaModule],
  controllers: [AreasController],
  providers: [AreasService],
})
export class AreasModule {}
