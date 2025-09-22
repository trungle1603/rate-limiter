import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { IRateLimitResult } from '../interfaces/rate-limit-result.interface';
import { IRateLimitStrategies } from '../interfaces/rate-limit-strategies.interface';
import { IRateLimitStrategyHandler } from '../interfaces/rate-limit-strategy-handler.interface';
import { RateLimitStrategyHandlerStorage } from './rate-limit-strategy-handler.storage';

type TokenBucketOpts = {
  capacity: number;
  refillRate: number;
};

type IdentityData = {
  tokens: number; // current available tokens
  lastRefill: number; // track last refill timestamp
};

export class TokenBucketStrategy implements IRateLimitStrategies {
  constructor({ capacity, refillRate }: TokenBucketOpts) {
    this.capacity = capacity; // max number of tokens
    this.refillRate = refillRate; // tokens added per second
  }

  name = 'TokenBucket';
  capacity: number; // max number of tokens
  refillRate: number; // tokens added per second
}

@Injectable()
export class TokenBucketStrategyHandler
  implements IRateLimitStrategyHandler<TokenBucketStrategy>
{
  constructor(
    private readonly strategyHandlerStorage: RateLimitStrategyHandlerStorage,
    private readonly redisService: RedisService,
  ) {
    this.strategyHandlerStorage.add(TokenBucketStrategy, this);
  }

  async consume(
    strategy: TokenBucketStrategy,
    identityKey: string,
  ): Promise<IRateLimitResult> {
    const consumeTokenCountPerRequest = 1;
    const { capacity = 10, refillRate = 1 } = strategy;
    const identityData = await this.getIdentityData(identityKey, capacity);

    this.refill(refillRate, capacity, identityData);

    let allowed = false;
    let retryAfter = 0;

    if (identityData.tokens >= consumeTokenCountPerRequest) {
      identityData.tokens -= consumeTokenCountPerRequest;
      allowed = true;
    } else {
      // not enough tokens → compute retryAfter
      const missing = consumeTokenCountPerRequest - identityData.tokens;
      retryAfter = missing / refillRate;
    }

    const remainingTokens = Math.floor(identityData.tokens);

    await this.redisService.set(identityKey, identityData);

    return {
      allowed,
      remaining: remainingTokens,
      limit: capacity,
      retryAfter, // seconds until next allowed
    };
  }

  private async getIdentityData(
    identityKey: string,
    capacity: number,
  ): Promise<IdentityData> {
    const identityData = await this.redisService.get<IdentityData>(identityKey);

    return identityData
      ? identityData
      : {
          tokens: capacity,
          lastRefill: Date.now(),
        };
  }

  // refill tokens based on elapsed time
  private refill(
    refillRate: number,
    capacity: number,
    identityData: IdentityData,
  ) {
    const now = Date.now();
    const elapsedSeconds = (now - identityData.lastRefill) / 1000;
    const tokensToAdd = elapsedSeconds * refillRate;

    if (tokensToAdd > 0) {
      identityData.tokens = Math.min(
        capacity,
        identityData.tokens + tokensToAdd,
      );

      identityData.lastRefill = now;
    }
  }
}
