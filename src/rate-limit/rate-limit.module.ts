import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from '../redis/redis.module';
import { ApiKeyExtractor } from './extractors/api-key.extractor';
import { IpExtractor } from './extractors/ip.extractor';
import { RateLimitExtractorHandlerStorage } from './extractors/rate-limit-extractor-handler.storage';
import { RateLimitGuard } from './rate-limit.guard';
import { FixedWindowCounterStrategyHandler } from './strategies/fixed-window-counter.strategy';
import { RateLimitStrategyHandlerStorage } from './strategies/rate-limit-strategy-handler.storage';
import { TokenBucketStrategyHandler } from './strategies/token-bucket.strategy';

@Module({
  imports: [RedisModule],

  providers: [
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },

    // Extractor
    RateLimitExtractorHandlerStorage,
    IpExtractor,
    ApiKeyExtractor,

    // Strategies
    RateLimitStrategyHandlerStorage,
    FixedWindowCounterStrategyHandler,
    TokenBucketStrategyHandler,
  ],
})
export class RateLimitModule {}
