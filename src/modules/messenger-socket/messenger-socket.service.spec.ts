import { Test, TestingModule } from '@nestjs/testing';
import { MessengerSocketService } from './messenger-socket.service';

describe('MessengerSocketService', () => {
  let service: MessengerSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessengerSocketService],
    }).compile();

    service = module.get<MessengerSocketService>(MessengerSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
