import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async set<T>(key: string, value: T, ttl?: number) {
    return this.cacheManager.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get(key);
  }
}
