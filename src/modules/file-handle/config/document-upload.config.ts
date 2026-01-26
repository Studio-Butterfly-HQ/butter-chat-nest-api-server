import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

export const DOCUMENT_UPLOAD_PATH = 'knowledgebase/documents';
export const PUBLIC_UPLOAD_PATH = 'public';
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const documentUploadConfig = {
  storage: diskStorage({
    destination: (req: any, file, cb) => {
      const companyId = req.companyId;
      
      if (!companyId) {
        return cb(new ForbiddenException('Company ID is required for secure upload') as any, '');
      }
      
      const path = join(process.cwd(), DOCUMENT_UPLOAD_PATH, companyId.toString());
      
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
      
      cb(null, path);
    },
    filename: (req, file, cb) => {
      // Sanitize original filename to prevent security issues
      const sanitizedName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.\./g, '_'); // Prevent directory traversal
      
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${unique}-${sanitizedName}`;
      
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum 10 files at once
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          'Invalid file type. Allowed: PDF, DOC, DOCX, CSV, TXT, XLS, XLSX'
        ),
        false
      );
    }
    
    cb(null, true);
  },
};