import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './common/roles.decorator';
import { exec } from 'child_process';

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

@Post('/prisma/studio')
@UseGuards()
@Roles('SUPER_ADMIN', 'PROJECT_MANAGER')
async openStudio(): Promise<{ url: string }> {
  const studioProcess = exec('pnpm prisma:studio');
  // بعد از 10 دقیقه (600000 میلی‌ثانیه) پروسه را می‌بندد
  setTimeout(() => {
    studioProcess.kill();
  }, 6000);
  return { url: 'http://10.53.46.199:5555' };
}

}