import {
  Controller,
  Get,
  Post,
  Patch,
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
import { UpdateComponentDto } from './dto/update-component.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const getUploadDir = () =>
  process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

interface RequestWithUser {
  user: { id: string };
}

@Controller('components')
@UseGuards(JwtAuthGuard)
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post('upload-icon')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: any,
          _file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const uploadDir = getUploadDir();
          mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (
          req: any,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (
        req: any,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|svg\+xml)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadIcon(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const publicBase = (process.env.PUBLIC_UPLOAD_BASE_URL || '').replace(
      /\/$/,
      '',
    );
    return {
      url: `${publicBase}/uploads/${file.filename}`,
    };
  }

  @Post()
  create(@Body() dto: CreateComponentDto, @Request() req: RequestWithUser) {
    return this.componentsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query('workspaceId') workspaceId?: string) {
    return this.componentsService.findAll(workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateComponentDto,
    @Request() req: RequestWithUser,
  ) {
    return this.componentsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.componentsService.remove(id, req.user.id);
  }
}
