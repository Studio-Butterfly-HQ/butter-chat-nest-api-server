import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
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
} from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { DocumentsService } from './file-handle.service';
import { documentUploadConfig } from './config/document-upload.config';
import { ResponseUtil } from '../../common/utils/response.util';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard) // All routes require authentication
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Upload single document (company-isolated)
   */
  @Post('upload')
  @ApiOperation({ summary: 'Upload a single document to your company folder' })
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
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid company access' })
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
   */
  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple documents to your company folder (max 10)' })
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
          description: 'Document files (PDF, DOC, DOCX, CSV, TXT, XLS, XLSX)',
        },
      },
      required: ['documents'],
    },
  })
  @ApiResponse({ status: 201, description: 'Documents uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid company access' })
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
   */
  @Get('list')
  @ApiOperation({ summary: 'Get list of all your company documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Invalid company access' })
  async listDocuments(@Req() req) {
    const companyId = req.companyId;
    
    if (!companyId) {
      throw new ForbiddenException('Company ID not found in token');
    }

    const documents = await this.documentsService.listDocuments(companyId);

    return ResponseUtil.success(
      'Documents retrieved successfully',
      {
        total: documents.length,
        documents,
      }
    );
  }

  /**
   * Get single document file (company-isolated, only own files)
   */
  @Get(':filename')
  @ApiOperation({ summary: 'Get/download your company document' })
  @ApiParam({ name: 'filename', description: 'Document filename' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied to this file' })
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
    });

    // Stream the file
    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * Download document with forced download (company-isolated)
   */
  @Get(':filename/download')
  @ApiOperation({ summary: 'Force download your company document' })
  @ApiParam({ name: 'filename', description: 'Document filename' })
  @ApiResponse({ status: 200, description: 'Document download started' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied to this file' })
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
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  /**
   * Delete a document (company-isolated, only own files)
   */
  @Delete(':filename')
  @ApiOperation({ summary: 'Delete your company document' })
  @ApiParam({ name: 'filename', description: 'Document filename' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access denied to this file' })
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