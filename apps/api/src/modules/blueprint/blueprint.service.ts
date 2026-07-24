import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Blueprint } from './blueprint.entity';
import { UpdateBlueprintDto } from './blueprint.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class BlueprintService {
  // In-memory store
  private blueprints: Blueprint[] = [];

  constructor(private readonly projectsService: ProjectsService) {}

  async getBlueprintByProjectId(projectId: string, userId: string): Promise<Blueprint> {
    // Validate project exists
    await this.projectsService.findOne(projectId, userId);

    let blueprint = this.blueprints.find((b: Blueprint) => b.projectId === projectId);
    
    // Auto-create if it doesn't exist
    if (!blueprint) {
      blueprint = {
        id: uuidv4(),
        projectId,
        businessRequirements: '',
        functionalRequirements: '',
        nonFunctionalRequirements: '',
        architectureDecisions: '',
        technicalNotes: '',
        risks: '',
        milestones: '',
        deploymentPlan: '',
        securityPlan: '',
        testingPlan: '',
        maintenancePlan: '',
        updatedAt: new Date().toISOString(),
      };
      this.blueprints.push(blueprint);
    }
    
    return blueprint;
  }

  async updateBlueprint(projectId: string, updateDto: UpdateBlueprintDto, userId: string): Promise<Blueprint> {
    const blueprint = await this.getBlueprintByProjectId(projectId, userId);
    
    const updatedBlueprint = {
      ...blueprint,
      ...updateDto,
      updatedAt: new Date().toISOString(),
    };
    
    this.blueprints = this.blueprints.map((b: Blueprint) =>
      b.projectId === projectId ? updatedBlueprint : b,
    );
    
    return updatedBlueprint;
  }
}
