import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeburiResourcesService } from './weburi-resources.service';
import { WeburiResourcesController } from './weburi-resources.controller';
import { WeburiResource } from './entities/weburi-resource.entity';
import { WeburiResourcesRepository } from './weburi-resources.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WeburiResource])],
  controllers: [WeburiResourcesController],
  providers: [WeburiResourcesService, WeburiResourcesRepository],
  exports: [WeburiResourcesService],
})
export class WeburiResourcesModule {}