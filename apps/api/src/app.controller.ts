import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): object {
    return { name: 'ArchFlow API', version: '1.0.0', status: 'running' };
  }

  @Get('health')
  health(): object {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
