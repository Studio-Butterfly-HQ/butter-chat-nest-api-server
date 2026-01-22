import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MessengerSocketService } from './messenger-socket.service';
import { CreateMessengerSocketDto } from './dto/create-messenger-socket.dto';
import { UpdateMessengerSocketDto } from './dto/update-messenger-socket.dto';

@WebSocketGateway()
export class MessengerSocketGateway {
  constructor(private readonly messengerSocketService: MessengerSocketService) {}
}