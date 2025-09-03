import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { UpdateNavigationItemDto } from './dto/update-navigation-item.dto';
import { ReorderNavigationDto } from './dto/reorder-navigation.dto';
import { CheckTokenVersion } from '../common/check-token-version.decorator';
import { ListNavigationItemsDto } from './dto/list-navigation-items.dto';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigation: NavigationService) {}

  // Resolved (merged) menu for current user & org (for now expects orgId & roles passed explicitly from caller)
  @Get('org/:orgId/resolve')
  async resolveOrg(
    @Param('orgId', ParseIntPipe) orgId: number,
    @Query('orgRole') orgRole?: string,
    @Query('platformRoles') platformRolesCsv?: string,
  ) {
    const platformRoles = platformRolesCsv
      ? platformRolesCsv.split(',').filter(Boolean)
      : [];
    return this.navigation.buildResolvedMenu({
      organizationId: orgId,
      userOrgRole: (orgRole as any) || null,
      platformRoles: platformRoles as any,
    });
  }

  @Get('global')
  async listGlobal() {
    return this.navigation.findRawByOrg(null);
  }

  @Get()
  async listFiltered(@Query() query: ListNavigationItemsDto) {
    return this.navigation.listFiltered(query);
  }

  @Get('org/:orgId')
  async listOrg(@Param('orgId', ParseIntPipe) orgId: number) {
    return this.navigation.findRawByOrg(orgId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.navigation.findOne(id);
  }

  @Post()
  @CheckTokenVersion()
  async create(@Body() dto: CreateNavigationItemDto) {
    return this.navigation.create(dto);
  }

  @Patch(':id')
  @CheckTokenVersion()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNavigationItemDto,
  ) {
    return this.navigation.update(id, dto);
  }

  @Delete(':id')
  @CheckTokenVersion()
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.navigation.softDelete(id);
  }

  @Post('reorder')
  @CheckTokenVersion()
  async reorder(@Body() dto: ReorderNavigationDto) {
    return this.navigation.reorder(dto);
  }

  @Post(':id/toggle')
  @CheckTokenVersion()
  async toggle(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.navigation.toggle(id, isActive);
  }
}
