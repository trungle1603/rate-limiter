import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IRateLimitExtractorHandler } from '../interfaces/rate-limit-extractor-handler.interface';

@Injectable()
export class ApiKeyExtractor implements IRateLimitExtractorHandler {
  async getIdentityKey(context: ExecutionContext): Promise<string> {
    const request = context.switchToHttp().getRequest<Request>();

    return Promise.resolve(
      request.headers['x-api-key']?.toString() ?? 'no-api-key',
    );
  }
}
