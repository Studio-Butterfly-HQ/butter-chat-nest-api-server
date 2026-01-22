import { PartialType } from '@nestjs/mapped-types';
import { CreateMessengerFactoryDto } from './create-messenger-factory.dto';

export class UpdateMessengerFactoryDto extends PartialType(CreateMessengerFactoryDto) {}
