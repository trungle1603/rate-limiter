import { Global, Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { ApiKeyExtractor } from './extractors/api-key.extractor';
import { IpExtractor } from './extractors/ip.extractor';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitService } from './rate-limit.service';
import { TokenBucketStrategy } from './strategies/token-bucket.strategy';

@Global()
@Module({
  imports: [RedisModule],

  providers: [
    RateLimitService,
    {
      provide: 'RateLimitStrategy',
      useClass: TokenBucketStrategy,
    },
    TokenBucketStrategy,
    IpExtractor,
    ApiKeyExtractor,
    RateLimitGuard,
  ],
  exports: [RateLimitService],
})
export class RateLimitModule {}
