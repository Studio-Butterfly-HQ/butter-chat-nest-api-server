import { Module, OnModuleInit } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FileHandleController } from './file-handle.controller';
import { FileHandleService } from './file-handle.service';

@Module({
  imports: [
  ],
  controllers: [FileHandleController],
  providers: [FileHandleService],

})
export class FileHandleModule {}