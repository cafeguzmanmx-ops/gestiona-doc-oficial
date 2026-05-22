import { Module } from '@nestjs/common';
import { SecurityModule } from '../common/security/security.module';
import { DatabaseModule } from '../database/database.module';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
