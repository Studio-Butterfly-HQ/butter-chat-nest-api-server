import { Controller,Post,UseInterceptors, UploadedFile, ParseFilePipe} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file-handle')
export class FileHandleController {
  constructor() {}

  @Post('image/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @UploadedFile
    (
       new ParseFilePipe({
        validators:[
          //new FileTypeValidator({fileType:'image'})
        ],
        fileIsRequired: true,
       })
    )
    file: Express.Multer.File) {
    console.log(file.filename)
    console.log(file)
    return file.path
  }
}
