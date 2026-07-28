import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiEndpointDto, UpdateApiEndpointDto } from './api-design.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class ApiDesignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  async findAll(projectId: string, userId: string) {
    await this.projectsService.findOne(projectId, userId);
    return this.prisma.apiEndpoint.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(projectId: string, dto: CreateApiEndpointDto, userId: string) {
    const project = await this.projectsService.findOne(projectId, userId);
    if ((project as any).role === 'VIEWER') {
      throw new ForbiddenException('VIEWER cannot create API endpoints');
    }
    return this.prisma.apiEndpoint.create({
      data: {
        projectId,
        method: dto.method,
        path: dto.path,
        description: dto.description,
        requestSchema: dto.requestSchema,
        responseSchema: dto.responseSchema,
      },
    });
  }

  async update(
    projectId: string,
    id: string,
    dto: UpdateApiEndpointDto,
    userId: string,
  ) {
    const project = await this.projectsService.findOne(projectId, userId);
    if ((project as any).role === 'VIEWER') {
      throw new ForbiddenException('VIEWER cannot update API endpoints');
    }
    const endpoint = await this.prisma.apiEndpoint.findFirst({
      where: { id, projectId },
    });
    if (!endpoint) throw new NotFoundException('API Endpoint not found');

    return this.prisma.apiEndpoint.update({
      where: { id },
      data: {
        method: dto.method,
        path: dto.path,
        description: dto.description,
        requestSchema: dto.requestSchema || undefined,
        responseSchema: dto.responseSchema || undefined,
      },
    });
  }

  async remove(projectId: string, id: string, userId: string) {
    const project = await this.projectsService.findOne(projectId, userId);
    if ((project as any).role === 'VIEWER') {
      throw new ForbiddenException('VIEWER cannot delete API endpoints');
    }
    const endpoint = await this.prisma.apiEndpoint.findFirst({
      where: { id, projectId },
    });
    if (!endpoint) throw new NotFoundException('API Endpoint not found');

    await this.prisma.apiEndpoint.delete({
      where: { id },
    });
  }

  async exportSwagger(projectId: string, userId: string) {
    const endpoints = await this.findAll(projectId, userId);

    const paths: Record<string, any> = {};

    for (const ep of endpoints) {
      if (!paths[ep.path]) paths[ep.path] = {};
      paths[ep.path][ep.method.toLowerCase()] = {
        summary: ep.description || `${ep.method} ${ep.path}`,
        requestBody: ep.requestSchema
          ? {
              content: {
                'application/json': {
                  schema: ep.requestSchema,
                },
              },
            }
          : undefined,
        responses: {
          '200': {
            description: 'Successful response',
            content: ep.responseSchema
              ? {
                  'application/json': {
                    schema: ep.responseSchema,
                  },
                }
              : undefined,
          },
        },
      };
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'ArchFlow Project API',
        version: '1.0.0',
      },
      paths,
    };
  }
}
