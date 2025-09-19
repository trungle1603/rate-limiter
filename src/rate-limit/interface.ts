import { Request } from 'express';

export interface RateLimitStrategy {
  consume(key: string): Promise<RateLimitResult>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number; // how many requests left
  limit: number; // total allowed per window
  retryAfter: number; // seconds until next allowed request
}

export interface IdentityExtractor {
  extract(req: Request): Promise<string> | string;
}
