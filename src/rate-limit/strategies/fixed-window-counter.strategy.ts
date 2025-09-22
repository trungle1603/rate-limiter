import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { IRateLimitResult } from '../interfaces/rate-limit-result.interface';
import { IRateLimitStrategies } from '../interfaces/rate-limit-strategies.interface';
import { IRateLimitStrategyHandler } from '../interfaces/rate-limit-strategy-handler.interface';
import { RateLimitStrategyHandlerStorage } from './rate-limit-strategy-handler.storage';

type FixedWindowCounterOpts = {
  capacity: number;
  windowSizeInSeconds: number;
};

type IdentityData = {
  counter: number;
  windowStart: number;
};

export class FixedWindowCounterStrategy implements IRateLimitStrategies {
  constructor(
    { capacity, windowSizeInSeconds }: FixedWindowCounterOpts = {
      capacity: 10,
      windowSizeInSeconds: 60,
    },
  ) {
    this.capacity = capacity;
    this.windowSizeInSeconds = windowSizeInSeconds;
  }

  name: string;
  capacity: number;
  windowSizeInSeconds: number;
}

@Injectable()
export class FixedWindowCounterStrategyHandler
  implements IRateLimitStrategyHandler<FixedWindowCounterStrategy>
{
  private readonly algorithm = FixedWindowCounterStrategy.name;

  constructor(
    private readonly strategyHandlerStorage: RateLimitStrategyHandlerStorage,
    private readonly redisService: RedisService,
  ) {
    this.strategyHandlerStorage.add(FixedWindowCounterStrategy, this);
  }

  async consume(
    strategy: FixedWindowCounterStrategy,
    identityKey: string,
  ): Promise<IRateLimitResult> {
    const consumeTokenCountPerRequest = 1;
    const { capacity, windowSizeInSeconds } = strategy;
    const identityData = await this.getIdentityData(identityKey, capacity);

    this.resetCounter(identityData, { windowSizeInSeconds });

    let allowed = false;
    let retryAfter = 0;

    if (identityData.counter + consumeTokenCountPerRequest <= capacity) {
      identityData.counter += consumeTokenCountPerRequest;
      allowed = true;
    } else {
      // Calculate retryAfter (seconds left until new window)
      retryAfter =
        windowSizeInSeconds - (Date.now() - identityData.windowStart) / 1000;
    }

    await this.redisService.set(this.getKey(identityKey), identityData);

    console.log({
      allowed,
      remaining: Math.max(capacity - identityData.counter, 0),
      limit: capacity,
      retryAfter,
    });

    return {
      allowed,
      remaining: Math.max(capacity - identityData.counter, 0),
      limit: capacity,
      retryAfter,
      algorithm: this.algorithm,
    };
  }

  private async getIdentityData(
    identityKey: string,
    capacity: number,
  ): Promise<IdentityData> {
    const identityData = await this.redisService.get<IdentityData>(
      this.getKey(identityKey),
    );

    return identityData
      ? identityData
      : { counter: capacity, windowStart: Date.now() };
  }

  private getKey(identityKey: string) {
    return `RT:${this.algorithm}:${identityKey}`;
  }

  private resetCounter(
    identityData: IdentityData,
    config: {
      windowSizeInSeconds: number;
    },
  ) {
    const { windowSizeInSeconds } = config;
    const now = Date.now();
    const elapsed = (now - identityData.windowStart) / 1000;

    // If the window has expired → reset counter
    if (elapsed >= windowSizeInSeconds) {
      identityData.counter = 0;
      identityData.windowStart = now;
    }
  }
}
