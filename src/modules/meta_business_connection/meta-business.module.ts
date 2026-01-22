import { Module } from '@nestjs/common';
import { MetaBusinessController } from './meta-business.controller';

@Module({
  controllers: [MetaBusinessControllrer],
  providers: [],
})
export class MetaBusinessModule {}