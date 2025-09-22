import { IRateLimitResult } from './rate-limit-result.interface';
import { IRateLimitStrategies } from './rate-limit-strategies.interface';

export interface IRateLimitStrategyHandler<T extends IRateLimitStrategies> {
  consume(strategy: T, identityKey: string): Promise<IRateLimitResult>;
}
