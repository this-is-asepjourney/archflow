import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Workspace } from './workspace.entity';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspace.dto';

@Injectable()
export class WorkspacesService {
  private workspaces: Workspace[] = [];

  create(dto: CreateWorkspaceDto, ownerId: string): Workspace {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const workspace: Workspace = {
      id: uuidv4(),
      name: dto.name,
      slug,
      description: dto.description,
      ownerId,
      members: [{ userId: ownerId, role: 'OWNER' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workspaces.push(workspace);
    return workspace;
  }

  findAllForUser(userId: string): Workspace[] {
    return this.workspaces.filter((w) =>
      w.members.some((m) => m.userId === userId),
    );
  }

  findOne(id: string, userId: string): Workspace {
    const workspace = this.workspaces.find((w) => w.id === id);
    if (!workspace) throw new NotFoundException('Workspace not found');
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');
    return workspace;
  }

  update(id: string, dto: UpdateWorkspaceDto, userId: string): Workspace {
    const workspace = this.findOne(id, userId);
    const member = workspace.members.find((m) => m.userId === userId);
    if (member?.role !== 'OWNER' && member?.role !== 'EDITOR') {
      throw new ForbiddenException('Insufficient permissions');
    }
    if (dto.name) workspace.name = dto.name;
    if (dto.description !== undefined) workspace.description = dto.description;
    workspace.updatedAt = new Date();
    return workspace;
  }

  remove(id: string, userId: string): void {
    const workspace = this.findOne(id, userId);
    const member = workspace.members.find((m) => m.userId === userId);
    if (member?.role !== 'OWNER') {
      throw new ForbiddenException('Only owner can delete workspace');
    }
    this.workspaces = this.workspaces.filter((w) => w.id !== id);
  }
}
