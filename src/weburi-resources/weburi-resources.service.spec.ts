import { Test, TestingModule } from '@nestjs/testing';
import { WeburiResourcesService } from './weburi-resources.service';

describe('WeburiResourcesService', () => {
  let service: WeburiResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeburiResourcesService],
    }).compile();

    service = module.get<WeburiResourcesService>(WeburiResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
