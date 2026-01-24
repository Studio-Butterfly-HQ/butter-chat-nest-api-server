import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

@Injectable()
export class FileHandleService {
  uploadAvatar(file: Express.Multer.File): string {
    const uploadPath = join(process.cwd(), 'public/avatars');
    
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = unique + extname(file.originalname);
    const filePath = join(uploadPath, filename);

    writeFileSync(filePath, file.buffer);

    return `/avatars/${filename}`;
  }
}