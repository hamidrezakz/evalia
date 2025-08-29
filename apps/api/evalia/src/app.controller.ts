import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health(): Promise<{ db: string }> {
    try {
      await this.appService.dbPing();
      return { db: 'ok' };
    } catch (e) {
      return { db: 'error' };
    }
  }
}
