import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Requirement } from './requirement.entity';
import { CreateRequirementDto, UpdateRequirementDto } from './requirement.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class RequirementService {
  private requirements: Requirement[] = [];

  constructor(private readonly projectsService: ProjectsService) {}

  async findAllByProject(projectId: string, userId: string): Promise<Requirement[]> {
    await this.projectsService.findOne(projectId, userId);
    return this.requirements.filter((r: Requirement) => r.projectId === projectId);
  }

  async findOne(id: string, userId: string): Promise<Requirement> {
    const requirement = this.requirements.find((r: Requirement) => r.id === id);
    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }
    // ensure user has access to the project
    await this.projectsService.findOne(requirement.projectId, userId);
    return requirement;
  }

  async create(projectId: string, createDto: CreateRequirementDto, userId: string): Promise<Requirement> {
    await this.projectsService.findOne(projectId, userId);

    const requirement: Requirement = {
      id: uuidv4(),
      projectId,
      title: createDto.title,
      description: createDto.description || '',
      type: createDto.type,
      status: 'DRAFT',
      priority: createDto.priority || 'MEDIUM',
      linkedNodeIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.requirements.push(requirement);
    return requirement;
  }

  async update(id: string, updateDto: UpdateRequirementDto, userId: string): Promise<Requirement> {
    const requirement = await this.findOne(id, userId);

    const updatedRequirement = {
      ...requirement,
      ...updateDto,
      updatedAt: new Date().toISOString(),
    };

    this.requirements = this.requirements.map((r: Requirement) => (r.id === id ? updatedRequirement : r));
    return updatedRequirement;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    this.requirements = this.requirements.filter((r: Requirement) => r.id !== id);
  }
}
