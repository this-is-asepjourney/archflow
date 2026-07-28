import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateRequirementDto, UpdateRequirementDto } from './requirement.dto';

@Injectable()
export class RequirementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async findAllByProject(projectId: string, userId: string) {
    await this.projectsService.findOne(projectId, userId);
    return this.prisma.requirement.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
    });
    if (!requirement)
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    const project = await this.projectsService.findOne(
      requirement.projectId,
      userId,
    );
    return { ...requirement, role: (project as any).role };
  }

  async create(
    projectId: string,
    createDto: CreateRequirementDto,
    userId: string,
  ) {
    const project = await this.projectsService.findOne(projectId, userId);
    if ((project as any).role === 'VIEWER')
      throw new ForbiddenException('VIEWER cannot create requirements');
    return this.prisma.requirement.create({
      data: {
        projectId,
        createdById: userId,
        title: createDto.title,
        description: createDto.description || '',
        type: createDto.type,
        priority: createDto.priority || 'MEDIUM',
        status: 'DRAFT',
      },
    });
  }

  async update(id: string, updateDto: UpdateRequirementDto, userId: string) {
    const req = await this.findOne(id, userId);
    if ((req as any).role === 'VIEWER')
      throw new ForbiddenException('VIEWER cannot update requirements');
    return this.prisma.requirement.update({
      where: { id },
      data: { ...updateDto },
    });
  }

  async remove(id: string, userId: string) {
    const req = await this.findOne(id, userId);
    if ((req as any).role === 'VIEWER')
      throw new ForbiddenException('VIEWER cannot delete requirements');
    await this.prisma.requirement.delete({ where: { id } });
  }
}
