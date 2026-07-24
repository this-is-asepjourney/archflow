import { Module } from '@nestjs/common';
import { CanvasService } from './canvas.service';
import { CanvasController } from './canvas.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  providers: [CanvasService],
  controllers: [CanvasController],
  exports: [CanvasService],
})
export class CanvasModule {}
