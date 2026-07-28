import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(dto: CreateProjectDto, userId: string) {
    // Verify user has access to workspace
    const workspace = await this.workspacesService.findOne(
      dto.workspaceId,
      userId,
    );
    if (workspace.role === 'VIEWER') {
      throw new ForbiddenException('VIEWER cannot create projects');
    }

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        workspaceId: dto.workspaceId,
        ownerId: userId,
      },
    });

    if (dto.templateId) {
      const template = await this.prisma.template.findUnique({
        where: { id: dto.templateId },
      });
      if (template) {
        await this.prisma.canvas.create({
          data: {
            projectId: project.id,
            name: `${template.name} Architecture`,
            type: template.type,
            createdBy: userId,
            nodes: template.nodes || [],
            edges: template.edges || [],
            viewport: { x: 0, y: 0, zoom: 1 },
          },
        });
      }
    }

    return project;
  }

  async findAllForWorkspace(workspaceId: string, userId: string) {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    // Check workspace access
    const workspace = await this.workspacesService.findOne(
      project.workspaceId,
      userId,
    );
    return { ...project, role: workspace.role };
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.findOne(id, userId);
    if ((project as any).role === 'VIEWER') {
      throw new ForbiddenException('VIEWER cannot update projects');
    }
    return this.prisma.project.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);
    if ((project as any).role === 'VIEWER') {
      throw new ForbiddenException('Insufficient permissions');
    }
    await this.prisma.project.delete({ where: { id } });
  }
}
