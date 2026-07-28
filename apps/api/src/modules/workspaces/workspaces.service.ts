import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkspaceDto, ownerId: string) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        members: {
          create: { userId: ownerId, role: 'OWNER' },
        },
      },
      include: { members: true },
    });
    return workspace;
  }

  async findAllForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: { include: { members: true } } },
    });
    return memberships.map((m) => ({ ...m.workspace, role: m.role }));
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    const member = workspace.members.find((m) => m.userId === userId);
    if (!member) throw new ForbiddenException('Access denied');
    return { ...workspace, role: member.role };
  }

  async update(id: string, dto: UpdateWorkspaceDto, userId: string) {
    const workspace = await this.findOne(id, userId);
    if (workspace.role !== 'OWNER' && workspace.role !== 'EDITOR') {
      throw new ForbiddenException('Insufficient permissions');
    }
    return this.prisma.workspace.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
      include: { members: true },
    });
  }

  async remove(id: string, userId: string) {
    const workspace = await this.findOne(id, userId);
    if (workspace.role !== 'OWNER') {
      throw new ForbiddenException('Only owner can delete workspace');
    }
    await this.prisma.workspace.delete({ where: { id } });
  }
}
