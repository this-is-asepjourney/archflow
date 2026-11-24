import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API status info', () => {
      expect(appController.getRoot()).toEqual({
        name: 'ArchFlow API',
        version: '1.0.0',
        status: 'running',
      });
    });

    it('should return health status ok', () => {
      const result = appController.health() as { status: string; timestamp: string };
      expect(result.status).toBe('ok');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
