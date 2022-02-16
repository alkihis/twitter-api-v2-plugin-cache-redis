import { TwitterApiCachePluginCore } from '@twitter-api-v2/plugin-cache-core';
import type { RedisClientType } from 'redis';
import type { TwitterResponse } from 'twitter-api-v2';

export type TDefaultTTL = number | 'reset';

export interface ITwitterApiCachePluginRedisOptions {
  ttl?: TDefaultTTL;
  ttlIfNoRateLimit?: number;
}

export class TwitterApiCachePluginRedis extends TwitterApiCachePluginCore {
  constructor(protected client: RedisClientType<any, any>, protected options: ITwitterApiCachePluginRedisOptions = {}) {
    super();
  }

  protected getKeyPrefix() {
    return 'twitter-api-v2-cache-';
  }

  protected async hasKey(key: string) {
    const data = Number(await this.client.exists(key));
    return data > 0;
  }

  protected async getKey(key: string) {
    const data = await this.client.get(key) as string | undefined;
    if (data) {
      return JSON.parse(data) as TwitterResponse<any>;
    }
  }

  protected async setKey(key: string, response: TwitterResponse<any>) {
    const ttl = this.getTTLForResponse(response);

    if (ttl !== null) {
      await this.client.set(key, JSON.stringify(response), { PX: ttl > 0 ? ttl : undefined });
    }
  }

  protected getTTLForResponse(response: TwitterResponse<any>) {
    const ttl = this.options?.ttl ?? 'reset';

    if (typeof ttl === 'number') {
      if (ttl >= 0) {
        return ttl;
      }
      return null;
    }

    // On reset
    if (!response.rateLimit) {
      // Default to 15 minutes
      return this.options?.ttlIfNoRateLimit ?? (15 * 60 * 1000);
    }

    const msUntilReset = (response.rateLimit.reset * 1000) - Date.now();

    if (msUntilReset > 0) {
      return msUntilReset;
    }
    // Immediate deletion
    return 1;
  }
}

export default TwitterApiCachePluginRedis;
