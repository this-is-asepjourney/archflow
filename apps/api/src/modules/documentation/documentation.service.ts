import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { BlueprintService } from '../blueprint/blueprint.service';
import { RequirementService } from '../requirement/requirement.service';
import { CanvasService } from '../canvas/canvas.service';

@Injectable()
export class DocumentationService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly blueprintService: BlueprintService,
    private readonly requirementService: RequirementService,
    private readonly canvasService: CanvasService,
  ) {}

  async generateMarkdown(projectId: string, userId: string): Promise<string> {
    const project = await this.projectsService.findOne(projectId, userId);
    const blueprint = await this.blueprintService.getBlueprintByProjectId(projectId, userId);
    const requirements = await this.requirementService.findAllByProject(projectId, userId);
    const canvases = await this.canvasService.findAllForProject(projectId, userId);

    let md = `# Project Documentation: ${project.name}\n\n`;
    if (project.description) {
      md += `${project.description}\n\n`;
    }

    md += `---\n\n`;

    // 1. Architecture Decisions
    md += `## 1. Architecture Decisions (ADR)\n\n`;
    md += blueprint.architectureDecisions ? `${blueprint.architectureDecisions}\n\n` : `*No architecture decisions recorded.*\n\n`;

    // 2. Requirements
    md += `## 2. Requirements\n\n`;
    if (requirements.length > 0) {
      const br = requirements.filter(r => r.type === 'BUSINESS');
      const fr = requirements.filter(r => r.type === 'FUNCTIONAL');
      const nfr = requirements.filter(r => r.type === 'NON_FUNCTIONAL');

      if (br.length > 0) {
        md += `### Business Requirements\n`;
        br.forEach(r => md += `- **[${r.status}]** ${r.title}: ${r.description}\n`);
        md += `\n`;
      }
      if (fr.length > 0) {
        md += `### Functional Requirements\n`;
        fr.forEach(r => md += `- **[${r.status}]** ${r.title}: ${r.description}\n`);
        md += `\n`;
      }
      if (nfr.length > 0) {
        md += `### Non-Functional Requirements\n`;
        nfr.forEach(r => md += `- **[${r.status}]** ${r.title}: ${r.description}\n`);
        md += `\n`;
      }
    } else {
      md += `*No requirements recorded.*\n\n`;
    }

    // 3. Technical Notes & Risks
    md += `## 3. Technical Notes & Risks\n\n`;
    md += `### Technical Notes\n`;
    md += blueprint.technicalNotes ? `${blueprint.technicalNotes}\n\n` : `*None.*\n\n`;
    md += `### Risks\n`;
    md += blueprint.risks ? `${blueprint.risks}\n\n` : `*None.*\n\n`;

    // 4. Plans
    md += `## 4. Plans\n\n`;
    md += `### Milestones\n`;
    md += blueprint.milestones ? `${blueprint.milestones}\n\n` : `*None.*\n\n`;
    md += `### Deployment Plan\n`;
    md += blueprint.deploymentPlan ? `${blueprint.deploymentPlan}\n\n` : `*None.*\n\n`;
    md += `### Security Plan\n`;
    md += blueprint.securityPlan ? `${blueprint.securityPlan}\n\n` : `*None.*\n\n`;
    md += `### Testing Plan\n`;
    md += blueprint.testingPlan ? `${blueprint.testingPlan}\n\n` : `*None.*\n\n`;
    md += `### Maintenance Plan\n`;
    md += blueprint.maintenancePlan ? `${blueprint.maintenancePlan}\n\n` : `*None.*\n\n`;

    // 5. Diagrams
    md += `## 5. Diagrams Overview\n\n`;
    if (canvases.length > 0) {
      canvases.forEach((canvas: any) => {
        md += `### ${canvas.name} (${canvas.type})\n`;
        md += `- Nodes: ${canvas.nodes?.length || 0}\n`;
        md += `- Edges: ${canvas.edges?.length || 0}\n\n`;
      });
      md += `> Note: Diagram images must be exported manually via the Canvas Editor.\n\n`;
    } else {
      md += `*No diagrams created.*\n\n`;
    }

    return md;
  }
}
