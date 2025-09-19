import { Module } from '@nestjs/common';
import { CoffeesModule } from './coffees/coffees.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [RedisModule, RateLimitModule, CoffeesModule],
})
export class AppModule {}
