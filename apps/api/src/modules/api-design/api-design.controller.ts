import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiDesignService } from './api-design.service';
import { CreateApiEndpointDto, UpdateApiEndpointDto } from './api-design.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/api-endpoints')
export class ApiDesignController {
  constructor(private readonly apiDesignService: ApiDesignService) {}

  @Get()
  findAll(@Param('projectId') projectId: string, @Req() req: RequestWithUser) {
    return this.apiDesignService.findAll(projectId, req.user.id);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateApiEndpointDto,
    @Req() req: RequestWithUser,
  ) {
    return this.apiDesignService.create(projectId, dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApiEndpointDto,
    @Req() req: RequestWithUser,
  ) {
    return this.apiDesignService.update(projectId, id, dto, req.user.id);
  }

  @Delete(':id')
  async remove(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    await this.apiDesignService.remove(projectId, id, req.user.id);
    return { message: 'Deleted successfully' };
  }

  @Get('export/swagger')
  exportSwagger(
    @Param('projectId') projectId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.apiDesignService.exportSwagger(projectId, req.user.id);
  }
}
