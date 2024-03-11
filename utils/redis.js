const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient()
      .on('error', (err) => console.log(err));
  }

  isAlive() {
    return new Promise((resolve, reject) => {
      this.client.ping((err, response) => {
        if (err || response !== 'PONG') {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  async get(key) {
    const getAsync = await promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  async set(key, value, duration) {
    const setAsync = promisify(this.client.set).bind(this.client);
    await setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) reject(err);
        resolve(reply === 1);
      });
    });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
