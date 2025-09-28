import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
// Global JwtAuthGuard is applied via APP_GUARD; no need to use @UseGuards here.
import { OrganizationService } from './organization.service';
import { Roles } from '../common/roles.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ChangeOrganizationStatusDto } from './dto/change-org-status.dto';
@Controller('organizations')
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Roles({ any: ['SUPER_ADMIN'] })
  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto);
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Get()
  list(@Query() query: ListOrganizationsQueryDto) {
    return this.service.list(query);
  }

  @Get('my')
  listMine(@Req() req: Request) {
    const user = (req as any).user;
    // JwtStrategy returns userId, not sub/id
    const userId = user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.service.listForUser(Number(userId));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(Number(id), dto);
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(Number(id));
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Post(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeOrganizationStatusDto,
  ) {
    return this.service.changeStatus(Number(id), dto);
  }
}
