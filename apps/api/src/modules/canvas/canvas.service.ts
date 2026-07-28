import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateCanvasDto, UpdateCanvasDto } from './canvas.dto';

@Injectable()
export class CanvasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreateCanvasDto, userId: string) {
    const project = await this.projectsService.findOne(projectId, userId);
    if ((project as any).role === 'VIEWER') {
      throw new ForbiddenException('VIEWER cannot create canvases');
    }

    return this.prisma.canvas.create({
      data: {
        projectId,
        name: dto.name,
        type: dto.type as any,
        createdBy: userId,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    });
  }

  async findAllForProject(projectId: string, userId: string) {
    await this.projectsService.findOne(projectId, userId);
    return this.prisma.canvas.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const canvas = await this.prisma.canvas.findUnique({ where: { id } });
    if (!canvas) throw new NotFoundException('Canvas not found');
    const project = await this.projectsService.findOne(
      canvas.projectId,
      userId,
    );
    return { ...canvas, role: (project as any).role };
  }

  async update(id: string, dto: UpdateCanvasDto, userId: string) {
    const canvas = await this.findOne(id, userId);
    if ((canvas as any).role === 'VIEWER')
      throw new ForbiddenException('VIEWER cannot update canvases');
    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.nodes !== undefined) updateData.nodes = dto.nodes;
    if (dto.edges !== undefined) updateData.edges = dto.edges;
    if (dto.viewport !== undefined) updateData.viewport = dto.viewport;

    // Create a history snapshot if nodes or edges are updated
    if (dto.nodes || dto.edges) {
      await this.prisma.canvasHistory.create({
        data: {
          canvasId: id,
          nodes: (dto.nodes || canvas.nodes) as any,
          edges: (dto.edges || canvas.edges) as any,
          viewport: (dto.viewport || canvas.viewport) as any,
          savedBy: userId,
        },
      });

      // Keep only the last 20 snapshots
      const snapshots = await this.prisma.canvasHistory.findMany({
        where: { canvasId: id },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });

      if (snapshots.length > 20) {
        const toDelete = snapshots.slice(20).map((s: { id: string }) => s.id);
        await this.prisma.canvasHistory.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    }

    return this.prisma.canvas.update({ where: { id }, data: updateData });
  }

  async getHistory(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.canvasHistory.findMany({
      where: { canvasId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async restoreHistory(id: string, historyId: string, userId: string) {
    const canvas = await this.findOne(id, userId);
    if ((canvas as any).role === 'VIEWER')
      throw new ForbiddenException('VIEWER cannot restore history');
    const history = await this.prisma.canvasHistory.findUnique({
      where: { id: historyId },
    });
    if (!history || history.canvasId !== id) {
      throw new NotFoundException('History snapshot not found');
    }

    return this.prisma.canvas.update({
      where: { id },
      data: {
        nodes: history.nodes as any,
        edges: history.edges as any,
        viewport: history.viewport as any,
      },
    });
  }

  async remove(id: string, userId: string) {
    const canvas = await this.findOne(id, userId);
    if ((canvas as any).role === 'VIEWER')
      throw new ForbiddenException('VIEWER cannot delete canvases');
    await this.prisma.canvas.delete({ where: { id } });
  }

  async exportJson(id: string, userId: string) {
    const canvas = await this.findOne(id, userId);
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
