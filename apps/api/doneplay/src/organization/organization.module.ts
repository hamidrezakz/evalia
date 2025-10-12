import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { TeamMembershipService } from './team-membership.service';
import { TeamMembershipController } from './team-membership.controller';
import { AuthModule } from '../auth/auth.module';
import { AssetsModule } from '../assets/assets.module';
import { R2Service } from '../cloud/r2.service';
import { OrgCapabilityGuard } from '../common/org-capability.guard';

@Module({
  imports: [AuthModule, AssetsModule],
  controllers: [
    OrganizationController,
    MembershipController,
    TeamController,
    TeamMembershipController,
  ],
  providers: [
    PrismaService,
    OrganizationService,
    MembershipService,
    TeamService,
    TeamMembershipService,
    OrgCapabilityGuard,
    R2Service,
  ],
  exports: [
    OrganizationService,
    MembershipService,
    TeamService,
    TeamMembershipService,
  ],
})
export class OrganizationModule {}
