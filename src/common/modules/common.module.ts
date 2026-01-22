// src/common/common.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/modules/company/entities/company.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Company])],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class CommonModule {}