import { Module } from '@nestjs/common';
import { DocumentationController } from './documentation.controller';
import { DocumentationService } from './documentation.service';
import { ProjectsModule } from '../projects/projects.module';
import { BlueprintModule } from '../blueprint/blueprint.module';
import { RequirementModule } from '../requirement/requirement.module';
import { CanvasModule } from '../canvas/canvas.module';

@Module({
  imports: [ProjectsModule, BlueprintModule, RequirementModule, CanvasModule],
  controllers: [DocumentationController],
  providers: [DocumentationService],
})
export class DocumentationModule {}
