import { Test, TestingModule } from '@nestjs/testing';
import { MessengerFactoryController } from './messenger-factory.controller';
import { MessengerFactoryService } from './messenger-factory.service';

describe('MessengerFactoryController', () => {
  let controller: MessengerFactoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessengerFactoryController],
      providers: [MessengerFactoryService],
    }).compile();

    controller = module.get<MessengerFactoryController>(MessengerFactoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
