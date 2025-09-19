import { Injectable, Optional } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { RateLimitResult, RateLimitStrategy } from '../interface';

@Injectable()
export class TokenBucketStrategy implements RateLimitStrategy {
  private _capacity: number;
  private _refillRate: number;

  constructor(
    private readonly redisService: RedisService,
    @Optional() private capacity: number,
    @Optional() private refillRate: number, // tokensNumber per second
  ) {
    this._capacity = this.capacity ?? 10;
    this._refillRate = this.refillRate ?? 0.5;
  }

  private async getBucket(bucketKey: string) {
    return (
      (await this.redisService.cacheManager.get<{
        tokensNumber: string;
        lastRefill: string;
      }>(bucketKey)) ?? {
        tokensNumber: `${this._capacity}`,
        lastRefill: `${Date.now()}`,
      }
    );
  }

  async consume(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const bucketKey = `bucket:${key}`;

    const bucketData = await this.getBucket(bucketKey);

    let tokensNumber = Number(bucketData.tokensNumber);
    let lastRefill = Number(bucketData.lastRefill);

    const elapsed = (now - lastRefill) / 1000;
    const refill = Math.floor(elapsed * this._refillRate);

    if (refill > 0) {
      tokensNumber = Math.min(this._capacity, tokensNumber + refill);
      lastRefill = now;
    }

    const allowed = tokensNumber > 0;
    if (allowed) tokensNumber--;

    const retryAfter = allowed ? 0 : Math.ceil(1 / this._refillRate);

    await this.redisService.cacheManager.set(bucketKey, {
      tokensNumber: tokensNumber.toString(),
      lastRefill: lastRefill.toString(),
    });

    return {
      allowed,
      remaining: tokensNumber,
      limit: this._capacity,
      retryAfter,
    };
  }
}
