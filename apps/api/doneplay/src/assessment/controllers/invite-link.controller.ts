import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrgContextGuard } from '../../common/org-context.guard';
import { OrgContext } from '../../common/org-context.decorator';
import { Roles } from '../../common/roles.decorator';
import { InviteLinkService } from '../services/invite-link.service';

@Controller('invite-links')
export class InviteLinkController {
  constructor(private readonly service: InviteLinkService) {}

  // Create link for a session in an org
  @UseGuards(OrgContextGuard)
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  @Roles({ any: ['ORG:OWNER', 'ORG:MANAGER', 'SUPER_ADMIN'] })
  @Post('org/:orgId/session/:sessionId')
  create(
    @Param('orgId') orgId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const userId = Number(req?.user?.userId ?? req?.user?.sub);
    return this.service.create({
      organizationId: Number(orgId),
      sessionId: Number(sessionId),
      userId,
      ...dto,
    });
  }

  // List links for a session
  @UseGuards(OrgContextGuard)
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  @Roles({ any: ['ORG:OWNER', 'ORG:MANAGER', 'SUPER_ADMIN'] })
  @Get('org/:orgId/session/:sessionId')
  list(@Param('orgId') orgId: string, @Param('sessionId') sessionId: string) {
    return this.service.list(Number(orgId), Number(sessionId));
  }

  // Update a link (enable/disable, auto-join, auto-assign, label, limits)
  @UseGuards(OrgContextGuard)
  @OrgContext({ requireOrgRoles: ['OWNER', 'MANAGER'] })
  @Roles({ any: ['ORG:OWNER', 'ORG:MANAGER', 'SUPER_ADMIN'] })
  @Post('org/:orgId/session/:sessionId/:id')
  update(
    @Param('orgId') orgId: string,
    @Param('sessionId') sessionId: string,
    @Param('id') id: string,
    @Body()
    dto: {
      label?: string | null;
      enabled?: boolean;
      autoJoinOrg?: boolean;
      autoAssignSelf?: boolean;
      expiresAt?: string | null;
      maxUses?: number | null;
      allowedDomains?: string[];
    },
  ) {
    return this.service.update(
      Number(orgId),
      Number(sessionId),
      Number(id),
      dto,
    );
  }

  // Consume a link (requires auth) - no org guard; token controls scope
  @Post('consume')
  consume(@Body() body: { token: string }, @Req() req: any) {
    const userId = Number(req?.user?.userId ?? req?.user?.sub);
    return this.service.consume(body.token, userId);
  }

  // Resolve token without authentication to fetch org slug/name and session id
  // Useful for redirecting anonymous users to /auth/[slug]?redirect=/invite/[token]
  @Get('resolve/:token')
  resolve(@Param('token') token: string) {
    return this.service.resolve(token);
  }
}
