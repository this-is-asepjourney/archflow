import {
  Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards,
} from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { CreateCanvasDto, UpdateCanvasDto } from './canvas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/canvas')
export class CanvasController {
  constructor(private readonly canvasService: CanvasService) {}

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateCanvasDto,
    @Req() req: any,
  ) {
    return this.canvasService.create(projectId, dto, req.user.id);
  }

  @Get()
  findAll(@Param('projectId') projectId: string, @Req() req: any) {
    return this.canvasService.findAllForProject(projectId, req.user.id);
  }

  @Get(':canvasId')
  findOne(@Param('canvasId') canvasId: string, @Req() req: any) {
    return this.canvasService.findOne(canvasId, req.user.id);
  }

  @Patch(':canvasId')
  update(
    @Param('canvasId') canvasId: string,
    @Body() dto: UpdateCanvasDto,
    @Req() req: any,
  ) {
    return this.canvasService.update(canvasId, dto, req.user.id);
  }

  @Delete(':canvasId')
  remove(@Param('canvasId') canvasId: string, @Req() req: any) {
    this.canvasService.remove(canvasId, req.user.id);
    return { message: 'Canvas deleted' };
  }

  @Get(':canvasId/export/json')
  exportJson(@Param('canvasId') canvasId: string, @Req() req: any) {
    return this.canvasService.exportJson(canvasId, req.user.id);
  }
}
