import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IRateLimitExtractorHandler } from '../interfaces/rate-limit-extractor-handler.interface';

@Injectable()
export class IpExtractor implements IRateLimitExtractorHandler {
  async getIdentityKey(context: ExecutionContext): Promise<string> {
    const request = context.switchToHttp().getRequest<Request>();

    return Promise.resolve(request.ip ?? '127.0.0.1');
  }
}
