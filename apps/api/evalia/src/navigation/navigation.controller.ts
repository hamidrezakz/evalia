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

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigation: NavigationService) {}

  // Simplified single-role tree (platformRole یا orgRole یکی از اینها)
  @Get('role')
  async getByRole(
    @Query('platformRole') platformRole?: string,
    @Query('orgRole') orgRole?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.navigation.getTreeForRole({
      platformRole: platformRole ? (platformRole as any) : null,
      orgRole: orgRole ? (orgRole as any) : null,
      includeInactive: includeInactive === 'true',
    });
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
