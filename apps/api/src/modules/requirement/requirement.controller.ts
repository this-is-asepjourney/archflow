import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirementService } from './requirement.service';
import { CreateRequirementDto, UpdateRequirementDto } from './requirement.dto';

@Controller('projects/:projectId/requirements')
@UseGuards(JwtAuthGuard)
export class RequirementController {
  constructor(private readonly requirementService: RequirementService) {}

  @Get()
  findAll(@Param('projectId') projectId: string, @Req() req: any) {
    return this.requirementService.findAllByProject(projectId, req.user.id);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() createDto: CreateRequirementDto,
    @Req() req: any,
  ) {
    return this.requirementService.create(projectId, createDto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRequirementDto,
    @Req() req: any,
  ) {
    return this.requirementService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.requirementService.remove(id, req.user.id);
  }
}
