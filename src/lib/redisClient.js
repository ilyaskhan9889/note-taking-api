import { createClient } from 'redis';
import config from '../config/index.js';

let clientInstance;

function getRedisClient() {
  if (!clientInstance) {
    clientInstance = createClient({ url: config.redisUrl });
    clientInstance.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  return clientInstance;
}

export default getRedisClient;
