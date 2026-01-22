import { Test, TestingModule } from '@nestjs/testing';
import { FileHandleController } from './file-handle.controller';
import { FileHandleService } from './file-handle.service';

describe('FileHandleController', () => {
  let controller: FileHandleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileHandleController],
      providers: [FileHandleService],
    }).compile();

    controller = module.get<FileHandleController>(FileHandleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
