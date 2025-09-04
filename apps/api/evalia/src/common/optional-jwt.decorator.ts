import { SetMetadata } from '@nestjs/common';

export const OPTIONAL_JWT_KEY = 'optional-jwt';

/**
 * Decorator to allow endpoints to accept requests with or without JWT.
 * If JWT is present and valid, req.user will be set. If not, req.user will be undefined, but access is still allowed.
 * Usage: @OptionalJwt() on controller or route
 */
export const OptionalJwt = () => SetMetadata(OPTIONAL_JWT_KEY, true);
