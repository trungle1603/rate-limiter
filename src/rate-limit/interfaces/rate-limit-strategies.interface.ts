export interface IRateLimitStrategies<T extends object = any> {
  name: string;

  opts?: T;
}
