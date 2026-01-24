import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('file-handle')
export class FileHandleController {
  constructor() {}

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
  @UseInterceptors(FileInterceptor('avatar'))
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
    // Return the full URL instead of just the path
    const fileUrl = `/avatars/${file.filename}`;
    
    return {
      filename: file.filename,
      url: fileUrl,
      path: file.path,
    };
  }
}