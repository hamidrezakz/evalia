import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    const now = new Date();
    return {
      status: 'ok',
      timestamp: now.toISOString(),
      uptimeSeconds: process.uptime(),
      pid: process.pid,
      env: process.env.NODE_ENV || 'development'
    };
  }
}
