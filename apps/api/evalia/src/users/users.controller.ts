import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ListUsersDto } from './dto/list-users.dto';
import { OptionalJwtGuard } from '../common/optional-jwt.guard';
import { OptionalJwt } from '../common/optional-jwt.decorator';

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  // List users with filters. SUPER_ADMIN sees all; others can be restricted later (placeholder logic by guard).

  @Get()
  list(@Query() query: ListUsersDto) {
    return this.service.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(Number(id));
  }
}
