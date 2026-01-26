import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileHandleService } from './file-handle.service_public';
import { avatarUploadConfig } from './config/multer.config';

@Controller('file-handle')
export class FileHandleController {
  constructor(private readonly fileHandleService: FileHandleService) {} // Inject service

  @Post('image/avatar')
  @ApiOperation({ summary: 'Upload company logo/avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar',avatarUploadConfig))
  uploadAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({ fileType: 'image' })
        ],
        fileIsRequired: true,
      })
    )
    file: Express.Multer.File
  ) {
    const fileUrl = this.fileHandleService.uploadAvatar(file);
    
    return {
      filename: file.filename,
      url: fileUrl,
    };
  }
}