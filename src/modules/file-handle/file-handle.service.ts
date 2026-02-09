import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException 
} from '@nestjs/common';
import { existsSync, readdirSync, unlinkSync, statSync, renameSync } from 'fs';
import { join, normalize } from 'path';
import { DOCUMENT_UPLOAD_PATH, FOLDER_NAMES, ensureCompanyDirectories } from './config/document-upload.config';
import { SyncStatus } from './config/sync-status.enum';

export interface DocumentInfo {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
  url: string;
  syncStatus: SyncStatus;
  folder: string; // 'processed', 'notprocessed', or 'failed_to_process'
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
    
    // Use absolute path directly - no process.cwd()
    return join(DOCUMENT_UPLOAD_PATH, sanitizedCompanyId);
  }

  /**
   * Get folder path for specific processing status
   */
  private getFolderPath(companyId: string, folderName: string): string {
    return join(this.getCompanyDocumentPath(companyId), folderName);
  }

  /**
   * Determine sync status based on folder location
   */
  private getSyncStatus(folder: string): SyncStatus {
    switch (folder) {
      case FOLDER_NAMES.PROCESSED:
        return SyncStatus.SYNCED;
      case FOLDER_NAMES.NOT_PROCESSED:
        return SyncStatus.QUEUED;
      case FOLDER_NAMES.FAILED_TO_PROCESS:
        return SyncStatus.FAILED;
      default:
        return SyncStatus.QUEUED;
    }
  }

  /**
   * Find which folder contains the file
   */
  private findFileFolder(companyId: string, filename: string): string | null {
    const sanitizedFilename = filename.replace(/[\/\\]/g, '');
    
    for (const folderName of Object.values(FOLDER_NAMES)) {
      const filePath = join(this.getFolderPath(companyId, folderName), sanitizedFilename);
      if (existsSync(filePath)) {
        return folderName;
      }
    }
    
    return null;
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

    // Find which folder the file is in
    const folder = this.findFileFolder(companyId, sanitizedFilename);
    
    if (!folder) {
      throw new NotFoundException('Document not found');
    }

    const filePath = join(this.getFolderPath(companyId, folder), sanitizedFilename);
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
   * List all documents for a company from all folders
   */
  async listDocuments(companyId: string): Promise<DocumentInfo[]> {
    // Ensure directories exist
    ensureCompanyDirectories(companyId);

    const allDocuments: DocumentInfo[] = [];

    // Iterate through all folders
    for (const folderName of Object.values(FOLDER_NAMES)) {
      const folderPath = this.getFolderPath(companyId, folderName);

      if (!existsSync(folderPath)) {
        continue;
      }

      try {
        const files = readdirSync(folderPath);
        
        const documentInfos: DocumentInfo[] = files
          .filter(filename => {
            // Filter out hidden files and directories
            return !filename.startsWith('.') && filename.includes('-');
          })
          .map(filename => {
            const filePath = join(folderPath, filename);
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
              syncStatus: this.getSyncStatus(folderName),
              folder: folderName,
            };
          });

        allDocuments.push(...documentInfos);
      } catch (error) {
        // Continue to next folder if one fails
        console.error(`Error reading folder ${folderName}:`, error);
      }
    }

    // Sort by upload date (newest first)
    return allDocuments.sort((a, b) => 
      b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }

  /**
   * Get single document info (with company access validation)
   */
  async getDocument(companyId: string, filename: string): Promise<DocumentInfo> {
    // Validate company access first
    this.validateCompanyAccess(companyId, filename);
    
    const sanitizedFilename = filename.replace(/[\/\\]/g, '');
    
    // Find which folder contains the file
    const folder = this.findFileFolder(companyId, sanitizedFilename);
    
    if (!folder) {
      throw new NotFoundException('Document not found');
    }

    const filePath = join(this.getFolderPath(companyId, folder), sanitizedFilename);

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
        syncStatus: this.getSyncStatus(folder),
        folder,
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
    
    // Find which folder contains the file
    const folder = this.findFileFolder(companyId, sanitizedFilename);
    
    if (!folder) {
      throw new NotFoundException('Document not found');
    }

    const filePath = join(this.getFolderPath(companyId, folder), sanitizedFilename);

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
    
    // Find which folder contains the file
    const folder = this.findFileFolder(companyId, sanitizedFilename);
    
    if (!folder) {
      throw new NotFoundException('Document not found');
    }

    const filePath = join(this.getFolderPath(companyId, folder), sanitizedFilename);

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
   * Move document between folders (for processing workflow)
   */
  async moveDocument(
    companyId: string, 
    filename: string, 
    targetFolder: string
  ): Promise<DocumentInfo> {
    // Validate target folder
    if (!Object.values(FOLDER_NAMES).includes(targetFolder as any)) {
      throw new BadRequestException('Invalid target folder');
    }

    const sanitizedFilename = filename.replace(/[\/\\]/g, '');
    
    // Find current folder
    const currentFolder = this.findFileFolder(companyId, sanitizedFilename);
    
    if (!currentFolder) {
      throw new NotFoundException('Document not found');
    }

    // Don't move if already in target folder
    if (currentFolder === targetFolder) {
      return this.getDocument(companyId, filename);
    }

    const sourcePath = join(this.getFolderPath(companyId, currentFolder), sanitizedFilename);
    const targetPath = join(this.getFolderPath(companyId, targetFolder), sanitizedFilename);

    // Ensure target directory exists
    ensureCompanyDirectories(companyId);

    try {
      renameSync(sourcePath, targetPath);
      return this.getDocument(companyId, filename);
    } catch (error) {
      throw new BadRequestException('Failed to move document');
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
    const expectedBasePath = this.getCompanyDocumentPath(companyId);
    const filePath = normalize(file.path);
    
    if (!filePath.startsWith(normalize(expectedBasePath))) {
      // If file somehow ended up in wrong folder, delete it
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      throw new ForbiddenException('File upload security violation detected');
    }

    const parts = file.filename.split('-');
    const originalName = parts.length > 2 ? parts.slice(2).join('-') : file.filename;

    // Files are uploaded to 'notprocessed' folder initially
    return {
      filename: file.filename,
      originalName: originalName,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date(),
      url: `${this.getDocumentBaseUrl(companyId)}/${file.filename}`,
      syncStatus: SyncStatus.QUEUED,
      folder: FOLDER_NAMES.NOT_PROCESSED,
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