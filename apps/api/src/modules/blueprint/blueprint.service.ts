import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { UpdateBlueprintDto } from './blueprint.dto';

@Injectable()
export class BlueprintService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async getBlueprintByProjectId(projectId: string, userId: string) {
    await this.projectsService.findOne(projectId, userId);

    // Upsert — create if not exists
    return this.prisma.blueprint.upsert({
      where: { projectId },
      create: { projectId },
      update: {},
    });
  }

  async update(
    projectId: string,
    updateDto: UpdateBlueprintDto,
    userId: string,
  ) {
    const project = await this.projectsService.findOne(projectId, userId);
    if ((project as any).role === 'VIEWER') {
      throw new ForbiddenException('VIEWER cannot update blueprint');
    }

    return this.prisma.blueprint.upsert({
      where: { projectId },
      create: { projectId, ...updateDto },
      update: { ...updateDto },
    });
  }
}
