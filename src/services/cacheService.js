import config from '../config/index.js';
import getRedisClient from '../lib/redisClient.js';

const cacheService = {
  async get(key) {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },
  async set(key, value, ttlSeconds = config.cacheTtlSeconds) {
    const client = getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  },
  async del(keys) {
    const client = getRedisClient();
    const keyList = Array.isArray(keys) ? keys : [keys];
    if (keyList.length > 0) {
      await client.del(keyList);
    }
  }
};

export default cacheService;
