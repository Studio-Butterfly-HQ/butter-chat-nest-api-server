import { Test, TestingModule } from '@nestjs/testing';
import { MessengerFactoryService } from './messenger-factory.service';

describe('MessengerFactoryService', () => {
  let service: MessengerFactoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessengerFactoryService],
    }).compile();

    service = module.get<MessengerFactoryService>(MessengerFactoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
