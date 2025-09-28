import { SetMetadata } from '@nestjs/common';

// Marks an endpoint to enforce tokenVersion validation against current DB value
export const CHECK_TOKEN_VERSION_KEY = 'checkTokenVersion';
export const CheckTokenVersion = () =>
  SetMetadata(CHECK_TOKEN_VERSION_KEY, true);
