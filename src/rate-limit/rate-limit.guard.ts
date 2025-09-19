import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { IpExtractor } from './extractors/ip.extractor';
import { IdentityExtractor } from './interface';
import { RATE_LIMIT_OPTIONS, RateLimitOptions } from './rate-limit.decorator';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private rateLimitService: RateLimitService,
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const extractor = this.getExtractor(context);
    const clientKey = await extractor.extract(request);
    const result = await this.rateLimitService.checkLimit(clientKey);

    console.log(result);

    // Attach standard headers
    response.setHeader('X-RateLimit-Remaining', result.remaining);
    response.setHeader('X-RateLimit-Limit', result.limit);
    response.setHeader('X-RateLimit-Retry-After', result.retryAfter);

    if (!result.allowed) {
      throw new ForbiddenException('Rate limit exceeded');
    }

    return true;
  }

  private getExtractor(context: ExecutionContext) {
    const options =
      this.reflector.get<RateLimitOptions>(
        RATE_LIMIT_OPTIONS,
        context.getHandler(),
      ) ?? {};

    const ExtractorClass = options.identityExtractor ?? IpExtractor;

    const extractor: IdentityExtractor = this.moduleRef.get(ExtractorClass, {
      strict: false,
    });
    return extractor;
  }
}
