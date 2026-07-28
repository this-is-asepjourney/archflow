import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('categories')
  getCategories() {
    return this.templatesService.getCategories();
  }

  @Get()
  getTemplates(@Query('workspaceId') workspaceId?: string) {
    return this.templatesService.getTemplates(workspaceId);
  }

  @Get(':id')
  getTemplateById(@Param('id') id: string) {
    return this.templatesService.getTemplateById(id);
  }

  // Admin/seed only in a real app, but for now we allow anyone to create a template
  @Post()
  createTemplate(@Body() dto: any) {
    return this.templatesService.createTemplate(dto);
  }
}
