import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.templateCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getTemplates(workspaceId?: string) {
    const whereClause: any = {
      OR: [{ isOfficial: true }],
    };

    if (workspaceId) {
      whereClause.OR.push({ workspaceId });
    }

    return this.prisma.template.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getTemplateById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async createTemplate(dto: any) {
    return this.prisma.template.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        isOfficial: dto.isOfficial || false,
        nodes: dto.nodes || [],
        edges: dto.edges || [],
        categoryId: dto.categoryId,
        workspaceId: dto.workspaceId,
      },
    });
  }
}
