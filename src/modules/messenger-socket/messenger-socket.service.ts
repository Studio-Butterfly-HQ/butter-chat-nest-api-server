import { Injectable } from '@nestjs/common';
import { CreateMessengerSocketDto } from './dto/create-messenger-socket.dto';
import { UpdateMessengerSocketDto } from './dto/update-messenger-socket.dto';

@Injectable()
export class MessengerSocketService {
  create(createMessengerSocketDto: CreateMessengerSocketDto) {
    return 'This action adds a new messengerSocket';
  }

  findAll() {
    return `This action returns all messengerSocket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messengerSocket`;
  }

  update(id: number, updateMessengerSocketDto: UpdateMessengerSocketDto) {
    return `This action updates a #${id} messengerSocket`;
  }

  remove(id: number) {
    return `This action removes a #${id} messengerSocket`;
  }
}
