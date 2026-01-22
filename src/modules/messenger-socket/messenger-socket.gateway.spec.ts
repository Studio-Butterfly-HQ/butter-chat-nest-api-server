import { Test, TestingModule } from '@nestjs/testing';
import { MessengerSocketGateway } from './messenger-socket.gateway';
import { MessengerSocketService } from './messenger-socket.service';

describe('MessengerSocketGateway', () => {
  let gateway: MessengerSocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessengerSocketGateway, MessengerSocketService],
    }).compile();

    gateway = module.get<MessengerSocketGateway>(MessengerSocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
