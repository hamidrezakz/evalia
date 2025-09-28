import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
import { Roles } from '../common/roles.decorator';
import { UsersService } from './users.service';
import { ListUsersDto } from './dto/list-users.dto';
// Global JwtAuthGuard / RolesGuard are registered via APP_GUARD, so no need to repeat @UseGuards here.
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  // List users with filters. SUPER_ADMIN sees all; others can be restricted later (placeholder logic by guard).

  @Get()
  @Roles(
    'SUPER_ADMIN',
    'ANALYSIS_MANAGER',
    'SUPPORT',
    'ORG:OWNER',
    'ORG:MANAGER',
  )
  list(@Query() query: ListUsersDto) {
    return this.service.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(Number(id));
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() body: any) {
    // Accept partial fields; service enforces allowed updates
    return this.service.update(Number(id), body);
  }

  @Post()
  @Roles(
    'SUPER_ADMIN',
    'ANALYSIS_MANAGER',
    'SUPPORT',
    'ORG:OWNER',
    'ORG:MANAGER',
  )
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
