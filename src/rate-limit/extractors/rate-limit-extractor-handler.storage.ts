import { Injectable } from '@nestjs/common';
import { ERateLimitExtractor } from '../enums/rate-limit-extractor.enum';
import { IRateLimitExtractorHandler } from '../interfaces/rate-limit-extractor-handler.interface';
import { ApiKeyExtractor } from './api-key.extractor';
import { IpExtractor } from './ip.extractor';

@Injectable()
export class RateLimitExtractorHandlerStorage {
  private defaultExtractor = ERateLimitExtractor.IP_ADDRESS;
  private readonly collection: Record<
    ERateLimitExtractor,
    IRateLimitExtractorHandler
  >;

  constructor(
    private readonly ipExtractor: IpExtractor,
    private readonly apiKeyExtractor: ApiKeyExtractor,
  ) {
    this.collection = {
      [ERateLimitExtractor.IP_ADDRESS]: this.ipExtractor,
      [ERateLimitExtractor.API_KEY]: this.apiKeyExtractor,
    };
  }

  get(
    name: ERateLimitExtractor = this.defaultExtractor,
  ): IRateLimitExtractorHandler {
    const extractor = this.collection[name];

    if (!extractor) {
      throw new Error(`${name} dose not have associated with handler`);
    }

    return extractor;
  }
}
