import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from 'docx';
import { ProjectsService } from '../projects/projects.service';
import { BlueprintService } from '../blueprint/blueprint.service';
import { RequirementService } from '../requirement/requirement.service';
import { CanvasService } from '../canvas/canvas.service';
import { Requirement } from '../requirement/requirement.entity';
import { Canvas } from '../canvas/canvas.entity';

interface DocData {
  projectName: string;
  projectDescription?: string;
  blueprint: Awaited<ReturnType<BlueprintService['getBlueprintByProjectId']>>;
  requirements: any[];
  canvases: any[];
}

@Injectable()
export class DocumentationService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly blueprintService: BlueprintService,
    private readonly requirementService: RequirementService,
    private readonly canvasService: CanvasService,
  ) {}

  async generateMarkdown(projectId: string, userId: string): Promise<string> {
    const data = await this.collectDocData(projectId, userId);
    return this.buildMarkdown(data);
  }

  async generatePdfBuffer(projectId: string, userId: string): Promise<Buffer> {
    const data = await this.collectDocData(projectId, userId);
    return this.buildPdf(data);
  }

  async generateDocxBuffer(projectId: string, userId: string): Promise<Buffer> {
    const data = await this.collectDocData(projectId, userId);
    return this.buildDocx(data);
  }

  private async collectDocData(
    projectId: string,
    userId: string,
  ): Promise<DocData> {
    const project = await this.projectsService.findOne(projectId, userId);
    const blueprint = await this.blueprintService.getBlueprintByProjectId(
      projectId,
      userId,
    );
    const requirements = await this.requirementService.findAllByProject(
      projectId,
      userId,
    );
    const canvases = await this.canvasService.findAllForProject(
      projectId,
      userId,
    );

    return {
      projectName: project.name,
      projectDescription: project.description ?? undefined,
      blueprint,
      requirements,
      canvases,
    };
  }

  private resolveNodeLabels(canvases: Canvas[], nodeIds: string[]): string[] {
    return nodeIds.map((id) => {
      for (const canvas of canvases) {
        const node = canvas.nodes.find((n) => n.id === id);
        if (node) {
          const label = node.data?.label || node.type || id;
          return `${label} (${canvas.name})`;
        }
      }
      return id;
    });
  }

  private formatRequirement(r: Requirement, canvases: Canvas[]): string {
    const links = this.resolveNodeLabels(canvases, r.linkedNodeIds);
    let line = `- **[${r.status}]** [${r.priority}] ${r.title}`;
    if (r.description) line += `: ${r.description}`;
    if (links.length > 0) line += ` — *Linked: ${links.join(', ')}*`;
    return line + '\n';
  }

  private buildMarkdown(data: DocData): string {
    const {
      projectName,
      projectDescription,
      blueprint,
      requirements,
      canvases,
    } = data;

    let md = `# Project Documentation: ${projectName}\n\n`;
    if (projectDescription) md += `${projectDescription}\n\n`;
    md += `*Generated on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    md += `## 1. Blueprint — Requirements Overview\n\n`;
    md += `### Business Requirements\n`;
    md += blueprint.businessRequirements
      ? `${blueprint.businessRequirements}\n\n`
      : `*No business requirements recorded in blueprint.*\n\n`;
    md += `### Functional Requirements\n`;
    md += blueprint.functionalRequirements
      ? `${blueprint.functionalRequirements}\n\n`
      : `*No functional requirements recorded in blueprint.*\n\n`;
    md += `### Non-Functional Requirements\n`;
    md += blueprint.nonFunctionalRequirements
      ? `${blueprint.nonFunctionalRequirements}\n\n`
      : `*No non-functional requirements recorded in blueprint.*\n\n`;

    md += `## 2. Managed Requirements\n\n`;
    if (requirements.length > 0) {
      const groups: [string, Requirement[]][] = [
        [
          'Business Requirements',
          requirements.filter((r) => r.type === 'BUSINESS'),
        ],
        [
          'Functional Requirements',
          requirements.filter((r) => r.type === 'FUNCTIONAL'),
        ],
        [
          'Non-Functional Requirements',
          requirements.filter((r) => r.type === 'NON_FUNCTIONAL'),
        ],
      ];
      for (const [title, items] of groups) {
        if (items.length > 0) {
          md += `### ${title}\n`;
          items.forEach((r) => (md += this.formatRequirement(r, canvases)));
          md += `\n`;
        }
      }
    } else {
      md += `*No managed requirements recorded.*\n\n`;
    }

    md += `## 3. Architecture Decisions (ADR)\n\n`;
    md += blueprint.architectureDecisions
      ? `${blueprint.architectureDecisions}\n\n`
      : `*No architecture decisions recorded.*\n\n`;

    md += `## 4. Technical Notes & Risks\n\n`;
    md += `### Technical Notes\n`;
    md += blueprint.technicalNotes
      ? `${blueprint.technicalNotes}\n\n`
      : `*None.*\n\n`;
    md += `### Risks\n`;
    md += blueprint.risks ? `${blueprint.risks}\n\n` : `*None.*\n\n`;

    md += `## 5. Plans\n\n`;
    const plans: [string, string][] = [
      ['Milestones', blueprint.milestones],
      ['Deployment Plan', blueprint.deploymentPlan],
      ['Security Plan', blueprint.securityPlan],
      ['Testing Plan', blueprint.testingPlan],
      ['Maintenance Plan', blueprint.maintenancePlan],
    ];
    for (const [title, content] of plans) {
      md += `### ${title}\n`;
      md += content ? `${content}\n\n` : `*None.*\n\n`;
    }

    md += `## 6. Diagrams Overview\n\n`;
    if (canvases.length > 0) {
      canvases.forEach((canvas) => {
        md += `### ${canvas.name} (${canvas.type})\n`;
        md += `- Nodes: ${canvas.nodes?.length || 0}\n`;
        md += `- Edges: ${canvas.edges?.length || 0}\n`;
        if (canvas.nodes?.length > 0) {
          md += `- Components:\n`;
          canvas.nodes.forEach((node: any) => {
            const label = node.data?.label || node.type;
            const meta = [node.data?.ip, node.data?.port]
              .filter(Boolean)
              .join(':');
            md += `  - ${label}${meta ? ` (${meta})` : ''}\n`;
          });
        }
        md += `\n`;
      });
      md += `> Export diagram images via the Canvas Editor (PNG export).\n\n`;
    } else {
      md += `*No diagrams created.*\n\n`;
    }

    return md;
  }

  private buildPdf(data: DocData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const {
        projectName,
        projectDescription,
        blueprint,
        requirements,
        canvases,
      } = data;

      doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(`Project Documentation`, { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(projectName, { align: 'center' });
      if (projectDescription) {
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#555555')
          .text(projectDescription, { align: 'center' });
      }
      doc.moveDown();
      doc
        .fontSize(8)
        .fillColor('#888888')
        .text(`Generated on ${new Date().toLocaleString()}`, {
          align: 'center',
        });
      doc.fillColor('#000000');
      doc.moveDown(2);

      const section = (title: string, content?: string) => {
        doc.fontSize(14).font('Helvetica-Bold').text(title);
        doc.moveDown(0.3);
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(content?.trim() || 'None recorded.', { lineGap: 4 });
        doc.moveDown(1);
      };

      section(
        '1. Blueprint — Business Requirements',
        blueprint.businessRequirements,
      );
      section(
        '2. Blueprint — Functional Requirements',
        blueprint.functionalRequirements,
      );
      section(
        '3. Blueprint — Non-Functional Requirements',
        blueprint.nonFunctionalRequirements,
      );
      section(
        '4. Architecture Decisions (ADR)',
        blueprint.architectureDecisions,
      );

      doc.fontSize(14).font('Helvetica-Bold').text('5. Managed Requirements');
      doc.moveDown(0.3);
      if (requirements.length === 0) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text('No managed requirements recorded.');
      } else {
        requirements.forEach((r) => {
          const links = this.resolveNodeLabels(canvases, r.linkedNodeIds);
          doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`[${r.type}] ${r.title} (${r.status}, ${r.priority})`);
          if (r.description)
            doc.font('Helvetica').text(r.description, { indent: 10 });
          if (links.length > 0)
            doc
              .font('Helvetica-Oblique')
              .text(`Linked: ${links.join(', ')}`, { indent: 10 });
          doc.moveDown(0.5);
        });
      }
      doc.moveDown(0.5);

      section('6. Technical Notes', blueprint.technicalNotes);
      section('7. Risks', blueprint.risks);
      section('8. Milestones', blueprint.milestones);
      section('9. Deployment Plan', blueprint.deploymentPlan);
      section('10. Security Plan', blueprint.securityPlan);
      section('11. Testing Plan', blueprint.testingPlan);
      section('12. Maintenance Plan', blueprint.maintenancePlan);

      doc.fontSize(14).font('Helvetica-Bold').text('13. Diagrams Overview');
      doc.moveDown(0.3);
      if (canvases.length === 0) {
        doc.fontSize(10).font('Helvetica').text('No diagrams created.');
      } else {
        canvases.forEach((canvas) => {
          doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text(`${canvas.name} (${canvas.type})`);
          doc
            .fontSize(10)
            .font('Helvetica')
            .text(
              `Nodes: ${canvas.nodes?.length || 0} | Edges: ${canvas.edges?.length || 0}`,
            );
          canvas.nodes?.slice(0, 20).forEach((node: any) => {
            const label = node.data?.label || node.type;
            doc.text(`  • ${label}`, { indent: 10 });
          });
          if ((canvas.nodes?.length || 0) > 20) {
            doc.text(`  ... and ${canvas.nodes.length - 20} more`, {
              indent: 10,
            });
          }
          doc.moveDown(0.5);
        });
      }

      doc.end();
    });
  }

  private async buildDocx(data: DocData): Promise<Buffer> {
    const {
      projectName,
      projectDescription,
      blueprint,
      requirements,
      canvases,
    } = data;

    const sections: any[] = [];

    // Title
    sections.push(
      new Paragraph({
        text: `Project Documentation: ${projectName}`,
        heading: HeadingLevel.TITLE,
      }),
    );
    if (projectDescription) {
      sections.push(new Paragraph({ text: projectDescription }));
    }
    sections.push(
      new Paragraph({ text: `Generated on ${new Date().toLocaleString()}` }),
    );
    sections.push(new Paragraph({ text: '' })); // spacer

    // 1. Blueprint
    sections.push(
      new Paragraph({
        text: '1. Blueprint — Requirements Overview',
        heading: HeadingLevel.HEADING_1,
      }),
    );
    sections.push(
      new Paragraph({
        text: 'Business Requirements',
        heading: HeadingLevel.HEADING_2,
      }),
    );
    sections.push(
      new Paragraph({ text: blueprint.businessRequirements || 'None' }),
    );

    sections.push(
      new Paragraph({
        text: 'Functional Requirements',
        heading: HeadingLevel.HEADING_2,
      }),
    );
    sections.push(
      new Paragraph({ text: blueprint.functionalRequirements || 'None' }),
    );

    sections.push(
      new Paragraph({
        text: 'Non-Functional Requirements',
        heading: HeadingLevel.HEADING_2,
      }),
    );
    sections.push(
      new Paragraph({ text: blueprint.nonFunctionalRequirements || 'None' }),
    );

    // 2. Managed Requirements
    sections.push(
      new Paragraph({
        text: '2. Managed Requirements',
        heading: HeadingLevel.HEADING_1,
      }),
    );
    if (requirements.length === 0) {
      sections.push(
        new Paragraph({ text: 'No managed requirements recorded.' }),
      );
    } else {
      requirements.forEach((r) => {
        const links = this.resolveNodeLabels(canvases, r.linkedNodeIds);
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `[${r.type}] ${r.title} `, bold: true }),
              new TextRun(`(${r.status}, ${r.priority})`),
            ],
          }),
        );
        if (r.description)
          sections.push(new Paragraph({ text: r.description }));
        if (links.length > 0)
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Linked: ${links.join(', ')}`,
                  italics: true,
                }),
              ],
            }),
          );
        sections.push(new Paragraph({ text: '' }));
      });
    }

    const docx = new Document({
      sections: [{ properties: {}, children: sections }],
    });

    return await Packer.toBuffer(docx);
  }
}
