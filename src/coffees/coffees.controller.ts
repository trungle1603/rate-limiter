import { Controller, Get } from '@nestjs/common';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { CoffeesService } from './coffees.service';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get()
  @RateLimit()
  findAll() {
    return this.coffeesService.findAll();
  }
}
