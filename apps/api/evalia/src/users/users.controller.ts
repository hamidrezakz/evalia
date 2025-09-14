import { Controller, Get, Param, Query } from '@nestjs/common';
import { Roles } from '../common/roles.decorator';
import { UsersService } from './users.service';
import { ListUsersDto } from './dto/list-users.dto';
// Global JwtAuthGuard / RolesGuard are registered via APP_GUARD, so no need to repeat @UseGuards here.
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  // List users with filters. SUPER_ADMIN sees all; others can be restricted later (placeholder logic by guard).

  @Get()
  @Roles('SUPER_ADMIN', 'ORG:OWNER')
  list(@Query() query: ListUsersDto) {
    return this.service.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(Number(id));
  }
}
