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

    const filename = file.filename;
    //const filePath = join(uploadPath, filename);

    //writeFileSync(filePath, file.buffer);

    return `http://localhost:5599/public/avatars/${filename}`;
  }
}