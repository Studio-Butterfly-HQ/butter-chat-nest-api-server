import { PartialType } from '@nestjs/mapped-types';
import { CreateMessengerSocketDto } from './create-messenger-socket.dto';

export class UpdateMessengerSocketDto extends PartialType(CreateMessengerSocketDto) {
  id: number;
}
