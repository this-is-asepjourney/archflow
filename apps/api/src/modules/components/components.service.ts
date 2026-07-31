import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';

@Injectable()
export class ComponentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateComponentDto) {
    const existing = await this.prisma.componentDefinition.findUnique({
      where: { typeKey: createDto.typeKey },
    });

    if (existing) {
      throw new ConflictException(
        'Component with this type key already exists.',
      );
    }

    return await this.prisma.componentDefinition.create({
      data: {
        createdById: userId,
        workspaceId: createDto.workspaceId || null,
        name: createDto.name,
        category: createDto.category,
        typeKey: createDto.typeKey,
        iconUrl: createDto.iconUrl,
        description: createDto.description,
        vendor: createDto.vendor,
        propertiesSchema: createDto.propertiesSchema,
        visibility: createDto.visibility || 'private',
        status:
          createDto.visibility === 'public' ? 'pending_review' : 'published',
      },
    });
  }

  async findAll(workspaceId?: string) {
    return await this.prisma.componentDefinition.findMany({
      where: workspaceId ? {
        OR: [
          { visibility: 'public', status: 'published' },
          { workspaceId }
        ]
      } : {
        visibility: 'public', status: 'published'
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const comp = await this.prisma.componentDefinition.findUnique({
      where: { id },
    });
    if (!comp) throw new NotFoundException('Component not found');

    // Only creator can delete for now
    if (comp.createdById !== userId) {
      throw new ConflictException('Unauthorized to delete this component');
    }

    return await this.prisma.componentDefinition.delete({ where: { id } });
  }

  async update(id: string, userId: string, updateDto: UpdateComponentDto) {
    const comp = await this.prisma.componentDefinition.findUnique({
      where: { id },
    });
    if (!comp) throw new NotFoundException('Component not found');

    if (comp.createdById !== userId) {
      throw new ConflictException('Unauthorized to edit this component');
    }

    if (updateDto.typeKey && updateDto.typeKey !== comp.typeKey) {
      const existing = await this.prisma.componentDefinition.findUnique({
        where: { typeKey: updateDto.typeKey },
      });
      if (existing) {
        throw new ConflictException(
          'Component with this type key already exists.',
        );
      }
    }

    return await this.prisma.componentDefinition.update({
      where: { id },
      data: updateDto,
    });
  }
}
