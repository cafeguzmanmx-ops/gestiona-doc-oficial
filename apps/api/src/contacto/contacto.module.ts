import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ContactoController } from './contacto.controller';
import { ContactoService } from './contacto.service';

@Module({
  imports: [AuditoriaModule],
  controllers: [ContactoController],
  providers: [ContactoService],
})
export class ContactoModule {}
