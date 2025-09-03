import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ChangeOrganizationStatusDto } from './dto/change-org-status.dto';
import { Roles } from '../common/roles.decorator';

@Controller('organizations')
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: ListOrganizationsQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findById(Number(id));
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }

  @Post(':id/restore')
  @Roles('SUPER_ADMIN')
  restore(@Param('id') id: string) {
    return this.service.restore(Number(id));
  }

  @Post(':id/status')
  @Roles('SUPER_ADMIN')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeOrganizationStatusDto,
  ) {
    return this.service.changeStatus(Number(id), dto);
  }
}
