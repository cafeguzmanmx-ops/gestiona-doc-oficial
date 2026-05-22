import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
  imports: [AuditoriaModule],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
