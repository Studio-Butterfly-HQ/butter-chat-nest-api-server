import { Test, TestingModule } from '@nestjs/testing';
import { WeburiResourcesController } from './weburi-resources.controller';
import { WeburiResourcesService } from './weburi-resources.service';

describe('WeburiResourcesController', () => {
  let controller: WeburiResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeburiResourcesController],
      providers: [WeburiResourcesService],
    }).compile();

    controller = module.get<WeburiResourcesController>(WeburiResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
