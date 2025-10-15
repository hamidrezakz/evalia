import { SetMetadata } from '@nestjs/common';

export const ORG_CAPABILITY_KEY = 'orgCapability:req';

export type OrgCapabilityRequirement = {
  capability: string; // use Prisma enum literal
  // Which route param holds the organization id to check (default: 'id')
  orgIdParam?: string;
};

export const RequireOrgCapability = (
  capability: string,
  orgIdParam: string = 'id',
) =>
  SetMetadata(ORG_CAPABILITY_KEY, {
    capability,
    orgIdParam,
  } as OrgCapabilityRequirement);
