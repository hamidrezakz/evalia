import { Controller, Get, Query } from '@nestjs/common';
import { NavigationService } from './navigation.service';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigation: NavigationService) {}

  // Only endpoint: build tree for given platformRole OR orgRole (only one should be provided)
  @Get('tree')
  async getTree(
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
}
