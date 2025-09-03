import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ListUsersDto } from './dto/list-users.dto';
import { Roles } from '../common/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  // List users with filters. SUPER_ADMIN sees all; others can be restricted later (placeholder logic by guard).
  @Get()
  @Roles('SUPER_ADMIN')
  list(@Query() query: ListUsersDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  detail(@Param('id') id: string) {
    return this.service.detail(Number(id));
  }
}
