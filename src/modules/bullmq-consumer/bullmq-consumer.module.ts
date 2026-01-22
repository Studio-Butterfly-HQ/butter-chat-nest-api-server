// messenger.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullMQMessengerProcessor } from './consumer.messenger.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messenger',
    }),
  ],
  providers: [BullMQMessengerProcessor],
})
export class MessengerBullMQProducerModule {}
