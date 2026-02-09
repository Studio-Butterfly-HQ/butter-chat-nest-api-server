import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

// ABSOLUTE PATH - folder is outside project directory
export const DOCUMENT_UPLOAD_PATH = '/home/itachi/studio-butterfly/butter-app-knowledge-files';
export const PUBLIC_UPLOAD_PATH = 'public';
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Folder names for file processing status
export const FOLDER_NAMES = {
  NOT_PROCESSED: 'notprocessed',
  PROCESSED: 'processed',
  FAILED_TO_PROCESS: 'failed_to_process',
} as const;

/**
 * Ensure company directory structure exists with all subfolders
 */
export function ensureCompanyDirectories(companyId: string): void {
  // Use absolute path directly - no process.cwd()
  const basePath = join(DOCUMENT_UPLOAD_PATH, companyId.toString());
  
  // Create base company folder if it doesn't exist
  if (!existsSync(basePath)) {
    mkdirSync(basePath, { recursive: true });
  }

  // Create all subfolders
  Object.values(FOLDER_NAMES).forEach(folderName => {
    const folderPath = join(basePath, folderName);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }
  });
}

export const documentUploadConfig = {
  storage: diskStorage({
    destination: (req: any, file, cb) => {
      const companyId = req.companyId;
      
      if (!companyId) {
        return cb(new ForbiddenException('Company ID is required for secure upload') as any, '');
      }

      // Ensure all directories exist
      ensureCompanyDirectories(companyId);

      // Files are initially uploaded to 'notprocessed' folder
      // Use absolute path directly - no process.cwd()
      const path = join(
        DOCUMENT_UPLOAD_PATH, 
        companyId.toString(), 
        FOLDER_NAMES.NOT_PROCESSED
      );

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