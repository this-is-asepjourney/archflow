import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { CanvasModule } from './modules/canvas/canvas.module';
import { BlueprintModule } from './modules/blueprint/blueprint.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { DocumentationModule } from './modules/documentation/documentation.module';
import { ApiDesignModule } from './modules/api-design/api-design.module';
import { TemplatesModule } from './modules/templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    ProjectsModule,
    CanvasModule,
    BlueprintModule,
    RequirementModule,
    DocumentationModule,
    ApiDesignModule,
    TemplatesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
