import { applyDecorators, SetMetadata, Type, UseGuards } from '@nestjs/common';
import { IdentityExtractor } from './interface';
import { RateLimitGuard } from './rate-limit.guard';

export const RATE_LIMIT_OPTIONS = 'RATE_LIMIT_OPTIONS';

export interface RateLimitOptions {
  identityExtractor?: Type<IdentityExtractor>;
}

export const RateLimit = (options: RateLimitOptions) =>
  applyDecorators(
    UseGuards(RateLimitGuard),
    SetMetadata(RATE_LIMIT_OPTIONS, options),
  );
