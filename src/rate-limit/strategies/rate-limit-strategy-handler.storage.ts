import { Injectable, Type } from '@nestjs/common';
import { IRateLimitStrategies } from '../interfaces/rate-limit-strategies.interface';
import { IRateLimitStrategyHandler } from '../interfaces/rate-limit-strategy-handler.interface';

@Injectable()
export class RateLimitStrategyHandlerStorage {
  private readonly collection = new Map<
    Type<IRateLimitStrategies>,
    IRateLimitStrategyHandler<any>
  >();

  add<T extends IRateLimitStrategies>(
    rateLimitCls: Type<T>,
    handler: IRateLimitStrategyHandler<T>,
  ) {
    this.collection.set(rateLimitCls, handler);
  }

  get<T extends IRateLimitStrategies>(
    rateLimitCls: Type<T>,
  ): IRateLimitStrategyHandler<T> {
    const handler = this.collection.get(rateLimitCls);

    if (!handler) {
      throw new Error(
        `${rateLimitCls.name} dose not have associated with handler`,
      );
    }

    return handler as IRateLimitStrategyHandler<T>;
  }
}
