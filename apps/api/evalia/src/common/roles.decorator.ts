import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'required_roles';
// roles: array of strings e.g. ['SUPER_ADMIN'] or org-scoped: ORG:OWNER
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
