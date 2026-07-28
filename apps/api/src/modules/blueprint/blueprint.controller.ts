import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BlueprintService } from './blueprint.service';
import { UpdateBlueprintDto } from './blueprint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser {
  user: { id: string };
}

@Controller('projects/:projectId/blueprint')
@UseGuards(JwtAuthGuard)
export class BlueprintController {
  constructor(private readonly blueprintService: BlueprintService) {}

  @Get()
  getBlueprint(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.blueprintService.getBlueprintByProjectId(
      projectId,
      req.user.id,
    );
  }

  @Patch()
  updateBlueprint(
    @Param('projectId') projectId: string,
    @Body() updateDto: UpdateBlueprintDto,
    @Req() req: RequestWithUser,
  ) {
    return this.blueprintService.update(projectId, updateDto, req.user.id);
  }
}
