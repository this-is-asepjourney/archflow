import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Canvas } from './canvas.entity';
import { CreateCanvasDto, UpdateCanvasDto } from './canvas.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class CanvasService {
  private canvases: Canvas[] = [];

  constructor(private projectsService: ProjectsService) {}

  create(projectId: string, dto: CreateCanvasDto, userId: string): Canvas {
    this.projectsService.findOne(projectId, userId);

    const canvas: Canvas = {
      id: uuidv4(),
      projectId,
      name: dto.name,
      type: dto.type,
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.canvases.push(canvas);
    return canvas;
  }

  findAllForProject(projectId: string, userId: string): Canvas[] {
    this.projectsService.findOne(projectId, userId);
    return this.canvases.filter((c) => c.projectId === projectId);
  }

  findOne(id: string, userId: string): Canvas {
    const canvas = this.canvases.find((c) => c.id === id);
    if (!canvas) throw new NotFoundException('Canvas not found');
    this.projectsService.findOne(canvas.projectId, userId);
    return canvas;
  }

  update(id: string, dto: UpdateCanvasDto, userId: string): Canvas {
    const canvas = this.findOne(id, userId);
    if (dto.name !== undefined) canvas.name = dto.name;
    if (dto.nodes !== undefined) canvas.nodes = dto.nodes;
    if (dto.edges !== undefined) canvas.edges = dto.edges;
    if (dto.viewport !== undefined) canvas.viewport = dto.viewport;
    canvas.updatedAt = new Date();
    return canvas;
  }

  remove(id: string, userId: string): void {
    this.findOne(id, userId);
    this.canvases = this.canvases.filter((c) => c.id !== id);
  }

  exportJson(id: string, userId: string): object {
    const canvas = this.findOne(id, userId);
    return {
      id: canvas.id,
      name: canvas.name,
      type: canvas.type,
      nodes: canvas.nodes,
      edges: canvas.edges,
      viewport: canvas.viewport,
      exportedAt: new Date().toISOString(),
    };
  }
}
