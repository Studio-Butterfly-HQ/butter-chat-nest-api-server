import { Module } from '@nestjs/common';
import { MetaBusinessController } from './meta-business.controller';

@Module({
  controllers: [MetaBusinessController],
  providers: [],
})
export class MetaBusinessModule {}