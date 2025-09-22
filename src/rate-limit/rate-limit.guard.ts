import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERateLimitExtractor } from './enums/rate-limit-extractor.enum';
import { RateLimitExtractorHandlerStorage } from './extractors/rate-limit-extractor-handler.storage';
import { IRateLimitStrategies } from './interfaces/rate-limit-strategies.interface';
import {
  RATE_LIMIT_EXTRACTOR_KEY,
  RATE_LIMIT_STRATEGY_KEY,
} from './rate-limit.decorator';
import { FixedWindowCounterStrategy } from './strategies/fixed-window-counter.strategy';
import { RateLimitStrategyHandlerStorage } from './strategies/rate-limit-strategy-handler.storage';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly extractorHandlerStorage: RateLimitExtractorHandlerStorage,
    private readonly strategyHandlerStorage: RateLimitStrategyHandlerStorage,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const extractorHandler = this.getExtractorHandler(context);
    const { strategy, handler: strategyHandler } =
      this.getStrategyHandler(context);

    const identityKey = await extractorHandler.getIdentityKey(context);

    const { allowed, limit, remaining, retryAfter } =
      await strategyHandler.consume(strategy, identityKey);

    if (!allowed) {
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
        {
          description: JSON.stringify({
            'X-RateLimit-Remaining': remaining,
            'X-RateLimit-Limit': limit,
            'X-RateLimit-Reset': retryAfter.toFixed(2),
          }),
        },
      );
    }

    return true;
  }

  private getExtractorHandler(context: ExecutionContext) {
    const extractor =
      this.reflector.getAllAndOverride<ERateLimitExtractor>(
        RATE_LIMIT_EXTRACTOR_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? ERateLimitExtractor.IP_ADDRESS;

    const handler = this.extractorHandlerStorage.get(extractor);
    return handler;
  }

  private getStrategyHandler(context: ExecutionContext) {
    const strategy =
      this.reflector.getAllAndOverride<IRateLimitStrategies>(
        RATE_LIMIT_STRATEGY_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? new FixedWindowCounterStrategy();

    const handler = this.strategyHandlerStorage.get(
      strategy.constructor as Type,
    );
    return { handler, strategy };
  }

  // private getExtractor(context: ExecutionContext) {
  //   const options =
  //     this.reflector.get<RateLimitOptions>(
  //       RATE_LIMIT_OPTIONS,
  //       context.getHandler(),
  //     ) ?? {};

  //   const ExtractorClass = options.identityExtractor ?? IpExtractor;

  //   const extractor: IdentityExtractor = this.moduleRef.get(ExtractorClass, {
  //     strict: false,
  //   });
  //   return extractor;
  // }
}
