import { Module } from '@nestjs/common';
import { SecurityModule } from '../common/security/security.module';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

@Module({
  imports: [SecurityModule],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
