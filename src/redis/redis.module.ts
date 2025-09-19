import KeyvRedis, { Keyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              // store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis('redis://default:Admin_123@localhost:6380'),
          ],
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
