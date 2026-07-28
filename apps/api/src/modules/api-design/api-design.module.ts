import { Module } from '@nestjs/common';
import { ApiDesignController } from './api-design.controller';
import { ApiDesignService } from './api-design.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [ApiDesignController],
  providers: [ApiDesignService],
})
export class ApiDesignModule {}
