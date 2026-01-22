import { Module } from '@nestjs/common';
import { MessengerSocketService } from './messenger-socket.service';
import { MessengerSocketGateway } from './messenger-socket.gateway';

@Module({
  providers: [MessengerSocketGateway, MessengerSocketService],
})
export class MessengerSocketModule {}
