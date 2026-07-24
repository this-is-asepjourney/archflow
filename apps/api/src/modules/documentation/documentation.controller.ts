import { Controller, Get, Param, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentationService } from './documentation.service';

@Controller('projects/:projectId/documentation')
@UseGuards(JwtAuthGuard)
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Get('markdown')
  async getMarkdown(@Param('projectId') projectId: string, @Req() req: any) {
    const markdown = await this.documentationService.generateMarkdown(projectId, req.user.id);
    return { markdown };
  }

  @Get('export/markdown')
  async downloadMarkdown(@Param('projectId') projectId: string, @Req() req: any, @Res() res: Response) {
    const markdown = await this.documentationService.generateMarkdown(projectId, req.user.id);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename=project-${projectId}-docs.md`);
    res.send(markdown);
  }
}
