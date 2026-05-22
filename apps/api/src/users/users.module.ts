import { Module } from '@nestjs/common';
import { SecurityModule } from '../common/security/security.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SecurityModule, AuditoriaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
