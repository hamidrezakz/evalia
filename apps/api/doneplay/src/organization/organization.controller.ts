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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { Request } from 'express';
// Global JwtAuthGuard is applied via APP_GUARD; no need to use @UseGuards here.
import { OrganizationService } from './organization.service';
import { Roles } from '../common/roles.decorator';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListOrganizationsQueryDto } from './dto/list-organizations.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ChangeOrganizationStatusDto } from './dto/change-org-status.dto';
import { AddCapabilityDto } from './dto/add-capability.dto';
import { RemoveCapabilityDto } from './dto/remove-capability.dto';
import {
  CreateRelationshipDto,
  DeleteRelationshipDto,
} from './dto/relationship.dto';
import { RequireOrgCapability } from '../common/require-org-capability.decorator';

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

  // ---------- Capabilities ----------
  @Roles({ any: ['SUPER_ADMIN'] })
  @Get(':id/capabilities')
  listCapabilities(@Param('id') id: string) {
    return this.service.listCapabilities(Number(id));
  }

  @Roles({ any: ['SUPER_ADMIN'] })
  @Post(':id/capabilities')
  addCapability(@Param('id') id: string, @Body() dto: AddCapabilityDto) {
    return this.service.addCapability(Number(id), dto);
  }

  @Roles({ any: ['SUPER_ADMIN'] })
  @Delete(':id/capabilities')
  removeCapability(@Param('id') id: string, @Body() dto: RemoveCapabilityDto) {
    return this.service.removeCapability(Number(id), dto);
  }

  // ---------- Relationships ----------
  // Requires parent to have MASTER capability
  @Roles({ any: ['SUPER_ADMIN'] })
  @Post('relationships')
  createRelationship(@Body() dto: CreateRelationshipDto) {
    // Optionally guard can verify parent capability if we pass id via body; do in service-level checks for now
    return this.service.createRelationship(dto);
  }

  @Roles({ any: ['SUPER_ADMIN'] })
  @Delete('relationships')
  deleteRelationship(@Body() dto: DeleteRelationshipDto) {
    return this.service.deleteRelationship(dto);
  }

  @Get(':id/children')
  listChildren(@Param('id') id: string) {
    return this.service.listChildren(Number(id));
  }

  @Get(':id/parents')
  listParents(@Param('id') id: string) {
    return this.service.listParents(Number(id));
  }

  // ---------- Parent Organizations (distinct) ----------
  @Get('parents-only/list')
  listParentsOnly(@Query() query: ListOrganizationsQueryDto) {
    return this.service.listParentsOnly(query);
  }
}
