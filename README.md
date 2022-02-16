# @twitter-api-v2/plugin-cache-redis

> Cache requests of twitter-api-v2 using a Redis server

## Usage

```ts
import { createClient } from 'redis'
import { TwitterApi } from 'twitter-api-v2'
import { TwitterApiCachePluginRedis } from '@twitter-api-v2/plugin-cache-redis'

const redisInstance = createClient()
const client = new TwitterApi(yourKeys, { plugins: [new TwitterApiCachePluginRedis(redisInstance)] })

// First request: download from Twitter
await client.v2.me()

// Second request: served from Redis
await client.v2.me()

// One parameter has changed: new request to Twitter
await client.v2.me({ expansions: ['pinned_tweet_id'] })
```

## Behaviour

- Requests are not scoped by user, so the same request for different users will be cached under the same key. You can extend `TwitterApiCachePluginRedis` class to implement a different strategy.
- Default TTL is **when rate limit expires**. It means that request cache will be automatically deleted when your rate limit for a given endpoint is reset.

  You can edit this by setting the `ttl` options:

  ```ts
  const redisPlugin = new TwitterApiCachePluginRedis(redisInstance, { ttl: 60000 }) // 60 seconds (in milliseconds)
  ```

  Use `0` to disable TTL.
- If you leave default TTL option (`reset`), you should define a strategy to apply when a request without rate limit information comes in.
  Default strategy is to apply a TTL of 15 minutes.

  You can edit this by setting the `ttlIfNoRateLimit` options:

  ```ts
  const redisPlugin = new TwitterApiCachePluginRedis(redisInstance, { ttlIfNoRateLimit: 60000 }) // 60 seconds (in milliseconds)
  ```

  Use `0` to disable TTL.
  This option has no effect of `ttl` is a `number`.
