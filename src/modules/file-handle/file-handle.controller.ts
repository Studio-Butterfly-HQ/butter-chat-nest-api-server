import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  BadRequestException,
  StreamableFile,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DocumentsService } from './file-handle.service';
import { documentUploadConfig, FOLDER_NAMES } from './config/document-upload.config';
import { ResponseUtil } from '../../common/utils/response.util';
import { SyncStatus } from './config/sync-status.enum';

// DTOs for Swagger documentation
class DocumentInfoDto {
  @ApiProperty({ description: 'Unique filename stored on server', example: '1707567890123-456789-document.pdf' })
  filename: string;

  @ApiProperty({ description: 'Original filename uploaded by user', example: 'document.pdf' })
  originalName: string;

  @ApiProperty({ description: 'File size in bytes', example: 2048576 })
  size: number;

  @ApiProperty({ description: 'MIME type of the document', example: 'application/pdf' })
  mimetype: string;

  @ApiProperty({ description: 'Upload timestamp', example: '2026-02-10T10:30:00.000Z' })
  uploadedAt: Date;

  @ApiProperty({ description: 'URL to access/download the document', example: '/documents/company123/1707567890123-456789-document.pdf' })
  url: string;

  @ApiProperty({ 
    description: 'Sync status of the document', 
    enum: SyncStatus,
    example: SyncStatus.QUEUED 
  })
  syncStatus: SyncStatus;

  @ApiProperty({ 
    description: 'Folder where document is stored', 
    enum: ['processed', 'notprocessed', 'failed_to_process'],
    example: 'notprocessed' 
  })
  folder: string;
}

class UploadResponseDto {
  @ApiProperty({ description: 'Success message', example: 'Document uploaded successfully' })
  message: string;

  @ApiProperty({ type: DocumentInfoDto })
  data: DocumentInfoDto;
}

class UploadMultipleResponseDto {
  @ApiProperty({ description: 'Success message', example: '3 document(s) uploaded successfully' })
  message: string;

  @ApiProperty({ type: [DocumentInfoDto] })
  data: DocumentInfoDto[];
}

class ListDocumentsResponseDto {
  @ApiProperty({ description: 'Success message', example: 'Documents retrieved successfully' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number', example: 15 },
      documents: { type: 'array', items: { $ref: '#/components/schemas/DocumentInfoDto' } },
      groupedByStatus: {
        type: 'object',
        properties: {
          synced: { type: 'number', example: 10 },
          queued: { type: 'number', example: 3 },
          failed: { type: 'number', example: 2 },
        },
      },
    },
  })
  data: {
    total: number;
    documents: DocumentInfoDto[];
    groupedByStatus: {
      synced: number;
      queued: number;
      failed: number;
    };
  };
}

class MoveDocumentDto {
  @ApiProperty({
    description: 'Target folder to move the document to',
    enum: ['processed', 'notprocessed', 'failed_to_process'],
    example: 'processed',
  })
  targetFolder: string;
}

class DeleteResponseDto {
  @ApiProperty({ description: 'Success message', example: 'Document deleted successfully' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      filename: { type: 'string', example: '1707567890123-456789-document.pdf' },
    },
  })
  data: { filename: string };
}

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard) // All routes require authentication
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Upload single document (company-isolated)
   * Files are initially uploaded to 'notprocessed' folder with QUEUED status
   */
  @Post('upload')
  @ApiOperation({ 
    summary: 'Upload a single document to your company folder',
    description: `
      Uploads a document to your company's secure folder structure.
      - File is initially placed in 'notprocessed' folder with QUEUED status
      - Supported formats: PDF, DOC, DOCX, CSV, TXT, XLS, XLSX
      - Maximum file size: 100MB
      - Files are company-isolated for security
    `
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, DOC, DOCX, CSV, TXT, XLS, XLSX)',
        },
      },
      required: ['document'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Document uploaded successfully',
    type: UploadResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file type or size. File must be PDF, DOC, DOCX, CSV, TXT, XLS, or XLSX and under 100MB',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid file type. Allowed: PDF, DOC, DOCX, CSV, TXT, XLS, XLSX',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Company ID not found in token or invalid company access',
    schema: {
      example: {
        statusCode: 403,
        message: 'Company ID not found in token',
        error: 'Forbidden'
      }
    }
  })
  @UseInterceptors(FileInterceptor('document', documentUploadConfig))
  async uploadDocument(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      })
    )
    file: Express.Multer.File
  ) {
    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    const documentInfo = await this.documentsService.saveDocumentInfo(companyId, file);

    return ResponseUtil.created('Document uploaded successfully', documentInfo);
  }

  /**
   * Upload multiple documents (company-isolated)
   * Files are initially uploaded to 'notprocessed' folder with QUEUED status
   */
  @Post('upload-multiple')
  @ApiOperation({ 
    summary: 'Upload multiple documents to your company folder (max 10)',
    description: `
      Uploads multiple documents to your company's secure folder structure in a single request.
      - Files are initially placed in 'notprocessed' folder with QUEUED status
      - Maximum 10 files per request
      - Each file max 100MB
      - Supported formats: PDF, DOC, DOCX, CSV, TXT, XLS, XLSX
      - All files are company-isolated for security
    `
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Document files (PDF, DOC, DOCX, CSV, TXT, XLS, XLSX). Max 10 files.',
        },
      },
      required: ['documents'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Documents uploaded successfully',
    type: UploadMultipleResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid file type, size, or no files uploaded',
    schema: {
      example: {
        statusCode: 400,
        message: 'No files uploaded',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Company ID not found in token' 
  })
  @UseInterceptors(FilesInterceptor('documents', 10, documentUploadConfig))
  async uploadMultipleDocuments(
    @Req() req,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
      })
    )
    files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    const uploadedDocuments = await Promise.all(
      files.map(file => this.documentsService.saveDocumentInfo(companyId, file))
    );

    return ResponseUtil.created(
      `${uploadedDocuments.length} document(s) uploaded successfully`,
      uploadedDocuments
    );
  }

  /**
   * List all documents for the authenticated company only
   * Returns documents from all folders (processed, notprocessed, failed_to_process)
   * with their respective sync status
   */
  @Get('list')
  @ApiOperation({ 
    summary: 'Get list of all your company documents with sync status',
    description: `
      Retrieves all documents belonging to your company across all processing folders.
      - Returns documents from: processed, notprocessed, and failed_to_process folders
      - Each document includes syncStatus: SYNCED, QUEUED, or FAILED
      - Documents are sorted by upload date (newest first)
      - Includes grouped counts by sync status for easy filtering
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Documents retrieved successfully',
    type: ListDocumentsResponseDto,
    schema: {
      example: {
        message: 'Documents retrieved successfully',
        data: {
          total: 15,
          documents: [
            {
              filename: '1707567890123-456789-report.pdf',
              originalName: 'report.pdf',
              size: 2048576,
              mimetype: 'application/pdf',
              uploadedAt: '2026-02-10T10:30:00.000Z',
              url: '/documents/company123/1707567890123-456789-report.pdf',
              syncStatus: 'SYNCED',
              folder: 'processed'
            }
          ],
          groupedByStatus: {
            synced: 10,
            queued: 3,
            failed: 2
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Company ID not found in token' 
  })
  async listDocuments(@Req() req) {
    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    const documents = await this.documentsService.listDocuments(companyId);

    // Group documents by sync status for easier frontend consumption
    const groupedByStatus = {
      synced: documents.filter(doc => doc.syncStatus === 'SYNCED'),
      queued: documents.filter(doc => doc.syncStatus === 'QUEUED'),
      failed: documents.filter(doc => doc.syncStatus === 'FAILED'),
    };

    return ResponseUtil.success(
      'Documents retrieved successfully',
      {
        total: documents.length,
        documents,
        groupedByStatus: {
          synced: groupedByStatus.synced.length,
          queued: groupedByStatus.queued.length,
          failed: groupedByStatus.failed.length,
        },
      }
    );
  }

  /**
   * Get single document file (company-isolated, only own files)
   * Works across all folders (processed, notprocessed, failed_to_process)
   */
  @Get(':filename')
  @ApiOperation({ 
    summary: 'Get/view your company document',
    description: `
      Retrieves and streams a document file for viewing in browser.
      - Works across all folders (processed, notprocessed, failed_to_process)
      - Returns file with inline content disposition for browser viewing
      - Includes sync status and folder location in response headers
      - Company-isolated: can only access your own company's files
    `
  })
  @ApiParam({ 
    name: 'filename', 
    description: 'Document filename as returned from upload or list endpoints',
    example: '1707567890123-456789-document.pdf'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Document retrieved successfully. File will be streamed with appropriate content type.',
    content: {
      'application/pdf': {},
      'application/msword': {},
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {},
      'text/csv': {},
      'text/plain': {},
      'application/vnd.ms-excel': {},
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {},
    },
    headers: {
      'Content-Type': {
        description: 'MIME type of the document',
        schema: { type: 'string', example: 'application/pdf' }
      },
      'Content-Disposition': {
        description: 'Inline disposition with original filename',
        schema: { type: 'string', example: 'inline; filename="document.pdf"' }
      },
      'Content-Length': {
        description: 'File size in bytes',
        schema: { type: 'number', example: 2048576 }
      },
      'X-Company-Id': {
        description: 'Company ID that owns this document',
        schema: { type: 'string', example: 'company123' }
      },
      'X-Sync-Status': {
        description: 'Current sync status of the document',
        schema: { type: 'string', enum: ['SYNCED', 'QUEUED', 'FAILED'], example: 'SYNCED' }
      },
      'X-Folder': {
        description: 'Folder where document is stored',
        schema: { type: 'string', enum: ['processed', 'notprocessed', 'failed_to_process'], example: 'processed' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Document not found in any folder',
    schema: {
      example: {
        statusCode: 404,
        message: 'Document not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Access denied to this file. File may belong to another company or filename is invalid.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied: File not in company directory',
        error: 'Forbidden'
      }
    }
  })
  async getDocument(
    @Req() req,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    // This will validate that the file belongs to the company
    const documentInfo = await this.documentsService.getDocument(companyId, filename);
    const filePath = this.documentsService.getDocumentPath(companyId, filename);

    // Set headers
    res.set({
      'Content-Type': documentInfo.mimetype,
      'Content-Disposition': `inline; filename="${documentInfo.originalName}"`,
      'Content-Length': documentInfo.size,
      'X-Company-Id': companyId,
      'X-Sync-Status': documentInfo.syncStatus,
      'X-Folder': documentInfo.folder,
    });

    // Stream the file
    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * Download document with forced download (company-isolated)
   * Works across all folders (processed, notprocessed, failed_to_process)
   */
  @Get(':filename/download')
  @ApiOperation({ 
    summary: 'Force download your company document',
    description: `
      Downloads a document file with attachment disposition, forcing browser to download instead of view.
      - Works across all folders (processed, notprocessed, failed_to_process)
      - Returns file with attachment content disposition
      - Includes sync status and folder location in response headers
      - Company-isolated: can only access your own company's files
    `
  })
  @ApiParam({ 
    name: 'filename', 
    description: 'Document filename as returned from upload or list endpoints',
    example: '1707567890123-456789-document.pdf'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Document download started. File will be streamed with attachment disposition.',
    headers: {
      'Content-Type': {
        description: 'MIME type of the document',
        schema: { type: 'string', example: 'application/pdf' }
      },
      'Content-Disposition': {
        description: 'Attachment disposition with original filename for download',
        schema: { type: 'string', example: 'attachment; filename="document.pdf"' }
      },
      'Content-Length': {
        description: 'File size in bytes',
        schema: { type: 'number', example: 2048576 }
      },
      'X-Company-Id': {
        description: 'Company ID that owns this document',
        schema: { type: 'string', example: 'company123' }
      },
      'X-Sync-Status': {
        description: 'Current sync status of the document',
        schema: { type: 'string', enum: ['SYNCED', 'QUEUED', 'FAILED'], example: 'SYNCED' }
      },
      'X-Folder': {
        description: 'Folder where document is stored',
        schema: { type: 'string', enum: ['processed', 'notprocessed', 'failed_to_process'], example: 'processed' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Document not found in any folder' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Access denied to this file' 
  })
  async downloadDocument(
    @Req() req,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    const documentInfo = await this.documentsService.getDocument(companyId, filename);
    const filePath = this.documentsService.getDocumentPath(companyId, filename);

    // Force download
    res.set({
      'Content-Type': documentInfo.mimetype,
      'Content-Disposition': `attachment; filename="${documentInfo.originalName}"`,
      'Content-Length': documentInfo.size,
      'X-Company-Id': companyId,
      'X-Sync-Status': documentInfo.syncStatus,
      'X-Folder': documentInfo.folder,
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * Move document between folders (for processing workflow)
   * Use this to move files from notprocessed -> processed or failed_to_process
   */
  @Patch(':filename/move')
  @ApiOperation({ 
    summary: 'Move document between folders (processing workflow)',
    description: `
      Moves a document between processing folders to update its status.
      
      **Processing Workflow:**
      1. File uploads to 'notprocessed' with QUEUED status
      2. Your processing system handles the file
      3. Move to 'processed' (SYNCED) if successful
      4. Move to 'failed_to_process' (FAILED) if processing fails
      
      **Status Mapping:**
      - notprocessed → QUEUED
      - processed → SYNCED
      - failed_to_process → FAILED
      
      This endpoint allows you to update the document's location and status based on your processing results.
    `
  })
  @ApiParam({ 
    name: 'filename', 
    description: 'Document filename to move',
    example: '1707567890123-456789-document.pdf'
  })
  @ApiBody({
    type: MoveDocumentDto,
    description: 'Target folder for the document',
    examples: {
      moveToProcessed: {
        summary: 'Move to processed (success)',
        value: { targetFolder: 'processed' }
      },
      moveToFailed: {
        summary: 'Move to failed (error)',
        value: { targetFolder: 'failed_to_process' }
      },
      moveToQueue: {
        summary: 'Move back to queue (retry)',
        value: { targetFolder: 'notprocessed' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Document moved successfully. Returns updated document info with new folder and syncStatus.',
    schema: {
      example: {
        message: 'Document moved successfully',
        data: {
          filename: '1707567890123-456789-document.pdf',
          originalName: 'document.pdf',
          size: 2048576,
          mimetype: 'application/pdf',
          uploadedAt: '2026-02-10T10:30:00.000Z',
          url: '/documents/company123/1707567890123-456789-document.pdf',
          syncStatus: 'SYNCED',
          folder: 'processed'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid target folder. Must be one of: processed, notprocessed, failed_to_process',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid target folder. Must be one of: processed, notprocessed, failed_to_process',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Document not found in any folder' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Access denied to this file or company ID not found' 
  })
  async moveDocument(
    @Req() req,
    @Param('filename') filename: string,
    @Body('targetFolder') targetFolder: string
  ) {
    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    // Validate target folder
    if (!Object.values(FOLDER_NAMES).includes(targetFolder as any)) {
      throw new BadRequestException(
        `Invalid target folder. Must be one of: ${Object.values(FOLDER_NAMES).join(', ')}`
      );
    }

    const documentInfo = await this.documentsService.moveDocument(
      companyId,
      filename,
      targetFolder
    );

    return ResponseUtil.success('Document moved successfully', documentInfo);
  }

  /**
   * Delete a document (company-isolated, only own files)
   * Works across all folders (processed, notprocessed, failed_to_process)
   */
  @Delete(':filename')
  @ApiOperation({ 
    summary: 'Delete your company document',
    description: `
      Permanently deletes a document from your company's storage.
      - Works across all folders (processed, notprocessed, failed_to_process)
      - Automatically finds and deletes from the correct folder
      - Cannot be undone - file is permanently deleted
      - Company-isolated: can only delete your own company's files
    `
  })
  @ApiParam({ 
    name: 'filename', 
    description: 'Document filename to delete',
    example: '1707567890123-456789-document.pdf'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Document deleted successfully',
    type: DeleteResponseDto,
    schema: {
      example: {
        message: 'Document deleted successfully',
        data: {
          filename: '1707567890123-456789-document.pdf'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Document not found in any folder',
    schema: {
      example: {
        statusCode: 404,
        message: 'Document not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Valid JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Access denied to this file. File may belong to another company.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Access denied: File not in company directory',
        error: 'Forbidden'
      }
    }
  })
  async deleteDocument(@Req() req, @Param('filename') filename: string) {
    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    await this.documentsService.deleteDocument(companyId, filename);

    return ResponseUtil.success('Document deleted successfully', {
      filename,
    });
  }
}