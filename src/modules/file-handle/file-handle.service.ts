import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { existsSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join, normalize } from 'path';
import { DOCUMENT_UPLOAD_PATH } from './config/document-upload.config';

export interface DocumentInfo {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
  url: string;
}

@Injectable()
export class DocumentsService {
  
  /**
   * Get company's document directory path with security validation
   */
  private getCompanyDocumentPath(companyId: string): string {
    // Sanitize company ID to prevent directory traversal
    const sanitizedCompanyId = companyId.replace(/[^a-zA-Z0-9-_]/g, '');
    
    if (!sanitizedCompanyId || sanitizedCompanyId !== companyId) {
      throw new ForbiddenException('Invalid company ID');
    }
    
    return join(process.cwd(), DOCUMENT_UPLOAD_PATH, sanitizedCompanyId);
  }

  /**
   * Validate that the file belongs to the requesting company
   */
  private validateCompanyAccess(companyId: string, filename: string): void {
    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = filename.replace(/[\/\\]/g, '');
    
    if (sanitizedFilename !== filename) {
      throw new ForbiddenException('Invalid filename');
    }
    
    // Prevent path traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new ForbiddenException('Invalid filename format');
    }

    const filePath = join(this.getCompanyDocumentPath(companyId), sanitizedFilename);
    const normalizedPath = normalize(filePath);
    const companyPath = normalize(this.getCompanyDocumentPath(companyId));

    // Ensure the file is within the company's directory
    if (!normalizedPath.startsWith(companyPath)) {
      throw new ForbiddenException('Access denied: File not in company directory');
    }
  }

  /**
   * Get base URL for documents (secured, no direct access)
   */
  private getDocumentBaseUrl(companyId: string): string {
    return `/documents/${companyId}`;
  }

  /**
   * List all documents for a company (only their own)
   */
  async listDocuments(companyId: string): Promise<DocumentInfo[]> {
    const directoryPath = this.getCompanyDocumentPath(companyId);

    if (!existsSync(directoryPath)) {
      return [];
    }

    try {
      const files = readdirSync(directoryPath);
      
      const documentInfos: DocumentInfo[] = files
        .filter(filename => {
          // Filter out hidden files and directories
          return !filename.startsWith('.') && filename.includes('-');
        })
        .map(filename => {
          const filePath = join(directoryPath, filename);
          const stats = statSync(filePath);
          
          // Extract original name from filename (format: timestamp-random-originalname.ext)
          const parts = filename.split('-');
          const originalName = parts.length > 2 ? parts.slice(2).join('-') : filename;

          return {
            filename,
            originalName,
            size: stats.size,
            mimetype: this.getMimeType(filename),
            uploadedAt: stats.birthtime,
            url: `${this.getDocumentBaseUrl(companyId)}/${filename}`,
          };
        });

      // Sort by upload date (newest first)
      return documentInfos.sort((a, b) => 
        b.uploadedAt.getTime() - a.uploadedAt.getTime()
      );
    } catch (error) {
      throw new BadRequestException('Failed to retrieve documents');
    }
  }

  /**
   * Get single document info (with company access validation)
   */
  async getDocument(companyId: string, filename: string): Promise<DocumentInfo> {
    // Validate company access first
    this.validateCompanyAccess(companyId, filename);
    
    const sanitizedFilename = filename.replace(/[\/\\]/g, '');
    const filePath = join(this.getCompanyDocumentPath(companyId), sanitizedFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Document not found');
    }

    try {
      const stats = statSync(filePath);
      const parts = sanitizedFilename.split('-');
      const originalName = parts.length > 2 ? parts.slice(2).join('-') : sanitizedFilename;

      return {
        filename: sanitizedFilename,
        originalName,
        size: stats.size,
        mimetype: this.getMimeType(sanitizedFilename),
        uploadedAt: stats.birthtime,
        url: `${this.getDocumentBaseUrl(companyId)}/${sanitizedFilename}`,
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve document information');
    }
  }

  /**
   * Get document file path for streaming (with security validation)
   */
  getDocumentPath(companyId: string, filename: string): string {
    // Validate company access first
    this.validateCompanyAccess(companyId, filename);
    
    const sanitizedFilename = filename.replace(/[\/\\]/g, '');
    const filePath = join(this.getCompanyDocumentPath(companyId), sanitizedFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Document not found');
    }

    return filePath;
  }

  /**
   * Delete a document (with company access validation)
   */
  async deleteDocument(companyId: string, filename: string): Promise<void> {
    // Validate company access first
    this.validateCompanyAccess(companyId, filename);
    
    const sanitizedFilename = filename.replace(/[\/\\]/g, '');
    const filePath = join(this.getCompanyDocumentPath(companyId), sanitizedFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Document not found');
    }

    try {
      unlinkSync(filePath);
    } catch (error) {
      throw new BadRequestException('Failed to delete document');
    }
  }

  /**
   * Save uploaded document info
   */
  async saveDocumentInfo(
    companyId: string,
    file: Express.Multer.File
  ): Promise<DocumentInfo> {
    // Additional validation that file is in correct company folder
    const expectedPath = this.getCompanyDocumentPath(companyId);
    const filePath = normalize(file.path);
    
    if (!filePath.startsWith(normalize(expectedPath))) {
      // If file somehow ended up in wrong folder, delete it
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      throw new ForbiddenException('File upload security violation detected');
    }

    const parts = file.filename.split('-');
    const originalName = parts.length > 2 ? parts.slice(2).join('-') : file.filename;

    return {
      filename: file.filename,
      originalName: originalName,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
      url: `${this.getDocumentBaseUrl(companyId)}/${file.filename}`,
    };
  }

  /**
   * Get MIME type from filename extension
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Check if ext is undefined before using it as index
    if (!ext) {
      return 'application/octet-stream';
    }
    
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'csv': 'text/csv',
      'txt': 'text/plain',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}