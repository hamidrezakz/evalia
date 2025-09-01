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

@Module({
  imports: [],
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
  ],
  exports: [
    OrganizationService,
    MembershipService,
    TeamService,
    TeamMembershipService,
  ],
})
export class OrganizationModule {}
