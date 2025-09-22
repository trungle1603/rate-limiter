import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ERateLimitExtractor } from './enums/rate-limit-extractor.enum';
import { IRateLimitStrategies } from './interfaces/rate-limit-strategies.interface';
import { FixedWindowCounterStrategy } from './strategies/fixed-window-counter.strategy';

export const RATE_LIMIT_EXTRACTOR_KEY = 'rateLimitExtractorKey';
export const RATE_LIMIT_STRATEGY_KEY = 'rateLimitStrategyKey';

const defaultExtractor = ERateLimitExtractor.IP_ADDRESS;
const defaultStrategy = new FixedWindowCounterStrategy({
  capacity: 10,
  windowSizeInSeconds: 60,
});

export const RateLimit = (
  config: {
    extractor?: ERateLimitExtractor;
    strategy?: IRateLimitStrategies;
  } = {
    extractor: defaultExtractor,
    strategy: defaultStrategy,
  },
) =>
  applyDecorators(
    SetMetadata(RATE_LIMIT_EXTRACTOR_KEY, config.extractor ?? defaultExtractor),
    SetMetadata(RATE_LIMIT_STRATEGY_KEY, config.strategy ?? defaultStrategy),
  );
