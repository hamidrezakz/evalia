import { IsIn, IsString } from 'class-validator';

// Mirror Prisma enum literals to avoid coupling to @prisma/client at compile time
const CAPABILITIES = ['MASTER', 'BILLING_PROVIDER', 'ANALYTICS_HUB'] as const;
export type CapabilityLiteral = (typeof CAPABILITIES)[number];

export class AddCapabilityDto {
  @IsString()
  @IsIn(CAPABILITIES as unknown as string[])
  capability!: CapabilityLiteral;
}

export const CapabilityLiterals = CAPABILITIES;
