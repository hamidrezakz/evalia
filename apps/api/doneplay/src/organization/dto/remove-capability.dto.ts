import { IsIn, IsString } from 'class-validator';
import { CapabilityLiterals } from './add-capability.dto';

export class RemoveCapabilityDto {
  @IsString()
  @IsIn(CapabilityLiterals as unknown as string[])
  capability!: (typeof CapabilityLiterals)[number];
}
