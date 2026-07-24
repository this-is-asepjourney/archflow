import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlueprintService } from './blueprint.service';
import { UpdateBlueprintDto } from './blueprint.dto';

@Controller('projects/:projectId/blueprint')
@UseGuards(JwtAuthGuard)
export class BlueprintController {
  constructor(private readonly blueprintService: BlueprintService) {}

  @Get()
  getBlueprint(@Param('projectId') projectId: string, @Req() req: any) {
    return this.blueprintService.getBlueprintByProjectId(projectId, req.user.id);
  }

  @Patch()
  updateBlueprint(
    @Param('projectId') projectId: string,
    @Body() updateDto: UpdateBlueprintDto,
    @Req() req: any,
  ) {
    return this.blueprintService.updateBlueprint(projectId, updateDto, req.user.id);
  }
}
