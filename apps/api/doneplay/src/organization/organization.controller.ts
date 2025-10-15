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
import { UseGuards } from '@nestjs/common';
import { OrgCapabilityGuardFor } from '../common/org-capability.guard.factory';
import { Public } from '../common/public.decorator';

@Controller('organizations')
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Roles({ any: ['SUPER_ADMIN'] })
  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    const out = this.service.create(dto);
    return Promise.resolve(out).then((data) => ({
      message: 'سازمان جدید ایجاد شد',
      data,
    }));
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

  // Public branding for login by slug
  @Public()
  @Get('by-slug/:slug/public')
  getBySlugPublic(@Param('slug') slug: string) {
    return this.service.findBySlugPublic(slug);
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    const out = this.service.update(Number(id), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'اطلاعات سازمان بروزرسانی شد',
      data,
    }));
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Delete(':id')
  remove(@Param('id') id: string) {
    const out = this.service.softDelete(Number(id));
    return Promise.resolve(out).then((data) => ({
      message: 'سازمان حذف شد (قابل بازیابی)',
      data,
    }));
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    const out = this.service.restore(Number(id));
    return Promise.resolve(out).then((data) => ({
      message: 'سازمان بازیابی شد',
      data,
    }));
  }
  @Roles({ any: ['SUPER_ADMIN'] })
  @Post(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeOrganizationStatusDto,
  ) {
    const out = this.service.changeStatus(Number(id), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'وضعیت سازمان بروزرسانی شد',
      data,
    }));
  }

  // ---------- Capabilities ----------
  @Roles({
    any: ['SUPER_ADMIN', 'ANALYSIS_MANAGER'],
    orgAny: ['OWNER', 'MANAGER'],
  })
  @Get(':id/capabilities')
  listCapabilities(@Param('id') id: string) {
    return this.service.listCapabilities(Number(id));
  }

  @Roles({ any: ['SUPER_ADMIN'] })
  @Post(':id/capabilities')
  addCapability(@Param('id') id: string, @Body() dto: AddCapabilityDto) {
    const out = this.service.addCapability(Number(id), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'قابلیت به سازمان اضافه شد',
      data,
    }));
  }

  @Roles({ any: ['SUPER_ADMIN'] })
  @Delete(':id/capabilities')
  removeCapability(@Param('id') id: string, @Body() dto: RemoveCapabilityDto) {
    const out = this.service.removeCapability(Number(id), dto);
    return Promise.resolve(out).then((data) => ({
      message: 'قابلیت از سازمان حذف شد',
      data,
    }));
  }

  // ---------- Relationships ----------
  // Requires parent to have MASTER capability
  @UseGuards(
    OrgCapabilityGuardFor('MASTER', {
      source: 'body',
      key: 'parentOrganizationId',
    }),
  )
  @Post('relationships')
  createRelationship(@Body() dto: CreateRelationshipDto) {
    const out = this.service.createRelationship(dto);
    return Promise.resolve(out).then((data) => ({
      message: 'ارتباط سازمانی ثبت شد',
      data,
    }));
  }

  @UseGuards(
    OrgCapabilityGuardFor('MASTER', {
      source: 'body',
      key: 'parentOrganizationId',
    }),
  )
  @Delete('relationships')
  deleteRelationship(@Body() dto: DeleteRelationshipDto) {
    const out = this.service.deleteRelationship(dto);
    return Promise.resolve(out).then((data) => ({
      message: 'ارتباط سازمانی حذف شد',
      data,
    }));
  }

  @Get(':id/children')
  listChildren(
    @Param('id') id: string,
    @Query() query: ListOrganizationsQueryDto,
  ) {
    return this.service.listChildren(Number(id), query);
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
