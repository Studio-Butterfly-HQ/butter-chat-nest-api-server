// src/modules/social-connection/social-connection.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialConnectionController } from './social-connection.controller';
import { SocialConnectionService } from './social-connection.service';
import { SocialConnectionRepository } from './social-connection.repository';
import { SocialConnection } from '../meta_business_connection/entity/social-connection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocialConnection])],
  controllers: [SocialConnectionController],
  providers: [SocialConnectionService, SocialConnectionRepository],
  exports: [SocialConnectionService, SocialConnectionRepository],
})
export class SocialConnectionModule {}