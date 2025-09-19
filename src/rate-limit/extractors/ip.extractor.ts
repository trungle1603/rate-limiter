import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IdentityExtractor } from '../interface';

@Injectable()
export class IpExtractor implements IdentityExtractor {
  extract(req: Request): string {
    return req.ip ?? 'unknown';
  }
}
