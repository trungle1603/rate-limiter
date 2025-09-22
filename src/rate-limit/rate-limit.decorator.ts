import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ERateLimitExtractor } from './enums/rate-limit-extractor.enum';
import { IRateLimitStrategies } from './interfaces/rate-limit-strategies.interface';
import { TokenBucketStrategy } from './strategies/token-bucket.strategy';

export const RATE_LIMIT_EXTRACTOR_KEY = 'rateLimitExtractorKey';
export const RATE_LIMIT_STRATEGY_KEY = 'rateLimitStrategyKey';

export const RateLimit = (
  extractor: ERateLimitExtractor = ERateLimitExtractor.IP_ADDRESS,
  strategy: IRateLimitStrategies = new TokenBucketStrategy({
    capacity: 10,
    refillRate: 1,
  }),
) =>
  applyDecorators(
    SetMetadata(RATE_LIMIT_EXTRACTOR_KEY, extractor),
    SetMetadata(RATE_LIMIT_STRATEGY_KEY, strategy),
  );
