import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ProjectsService {
  private projects: Project[] = [];

  constructor(private workspacesService: WorkspacesService) {}

  create(dto: CreateProjectDto, userId: string): Project {
    // Verify user has access to workspace
    this.workspacesService.findOne(dto.workspaceId, userId);

    const project: Project = {
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      workspaceId: dto.workspaceId,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.push(project);
    return project;
  }

  findAllForWorkspace(workspaceId: string, userId: string): Project[] {
    this.workspacesService.findOne(workspaceId, userId);
    return this.projects.filter((p) => p.workspaceId === workspaceId);
  }

  findOne(id: string, userId: string): Project {
    const project = this.projects.find((p) => p.id === id);
    if (!project) throw new NotFoundException('Project not found');
    // Check workspace access
    this.workspacesService.findOne(project.workspaceId, userId);
    return project;
  }

  update(id: string, dto: UpdateProjectDto, userId: string): Project {
    const project = this.findOne(id, userId);
    if (dto.name) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;
    project.updatedAt = new Date();
    return project;
  }

  remove(id: string, userId: string): void {
    const project = this.findOne(id, userId);
    const workspace = this.workspacesService.findOne(project.workspaceId, userId);
    const member = workspace.members.find((m) => m.userId === userId);
    if (member?.role === 'VIEWER') {
      throw new ForbiddenException('Insufficient permissions');
    }
    this.projects = this.projects.filter((p) => p.id !== id);
  }
}
