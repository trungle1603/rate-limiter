import { ExecutionContext } from '@nestjs/common';

export interface IRateLimitExtractorHandler {
  getIdentityKey(context: ExecutionContext): Promise<string>;
}
