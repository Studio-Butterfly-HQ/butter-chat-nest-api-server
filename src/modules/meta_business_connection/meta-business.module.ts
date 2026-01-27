import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from '../company/entities/company.entity';
import { SocialConnection } from './entity/social-connection.entity';
import { MetaBusinessController } from './meta-business.controller.main';

@Module({
  imports: [
    TypeOrmModule.forFeature([SocialConnection, Company])
  ],
  controllers: [MetaBusinessController],
  providers: [],
})
export class MetaBusinessModule {}