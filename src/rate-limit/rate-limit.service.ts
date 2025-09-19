// rate-limit.service.ts
import { Inject, Injectable } from '@nestjs/common';
import type { RateLimitStrategy } from './interface';

@Injectable()
export class RateLimitService {
  constructor(
    @Inject('RateLimitStrategy') private rateLimitStrategy: RateLimitStrategy,
  ) {}

  async checkLimit(key: string) {
    return this.rateLimitStrategy.consume(key);
  }
}
