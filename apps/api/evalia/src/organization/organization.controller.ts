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
// import { Roles } from '../auth/roles.decorator';

@Controller('organizations')
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post()
  // @Roles('SUPER_ADMIN')
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
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.softDelete(Number(id));
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.service.restore(Number(id));
  }

  @Post(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeOrganizationStatusDto,
  ) {
    return this.service.changeStatus(Number(id), dto);
  }
}
