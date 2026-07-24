import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CanvasModule } from './modules/canvas/canvas.module';
import { BlueprintModule } from './modules/blueprint/blueprint.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { DocumentationModule } from './modules/documentation/documentation.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ProjectsModule,
    CanvasModule,
    BlueprintModule,
    RequirementModule,
    DocumentationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}




