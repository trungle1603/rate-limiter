import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IdentityExtractor } from '../interface';

@Injectable()
export class ApiKeyExtractor implements IdentityExtractor {
  extract(req: Request): string {
    return req.headers['x-api-key']?.toString() ?? 'no-api-key';
  }
}
