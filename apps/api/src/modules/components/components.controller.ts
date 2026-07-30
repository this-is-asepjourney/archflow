import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post('upload-icon')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|svg\+xml)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadIcon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    // Return the URL that the frontend can use to access the uploaded file
    return {
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${file.filename}`,
    };
  }

  @Post()
  create(@Request() req: any, @Body() createDto: CreateComponentDto) {
    return this.componentsService.create(req.user?.userId as string, createDto);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId?: string) {
    return this.componentsService.findAll(workspaceId);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.componentsService.remove(id, req.user?.userId as string);
  }
}
