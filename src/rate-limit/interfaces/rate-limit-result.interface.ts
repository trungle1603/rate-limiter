export interface IRateLimitResult {
  allowed: boolean;
  remaining: number; // how many requests left
  limit: number; // total allowed per window
  retryAfter: number; // seconds until next allowed request
  algorithm: string;
}
