import { Module } from '@nestjs/common';
import { MessengerFactoryService } from './messenger-factory.service';
import { MessengerFactoryController } from './messenger-factory.controller';
import { MessengerFactoryRepository } from './messenger-factory.repository';
import { Conversation } from './entities/coversation.entity';
import { Message } from './entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationSummary } from './entities/conversation-summary.entity';
import { ConversationTag } from './entities/conversation-tag.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      ConversationSummary,
      ConversationTag
    ]),
  ],
  controllers: [MessengerFactoryController],
  providers: [MessengerFactoryService,MessengerFactoryRepository],
})
export class MessengerFactoryModule {}
