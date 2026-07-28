import { Module } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { CanvasController } from './canvas.controller';
import { ProjectsModule } from '../projects/projects.module';
import { CollaborationGateway } from './collaboration.gateway';

@Module({
  imports: [ProjectsModule],
  providers: [CanvasService, CollaborationGateway],
  controllers: [CanvasController],
  exports: [CanvasService],
})
export class CanvasModule {}
