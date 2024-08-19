/** @format */

const cache = new Map();

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    return cache.get(key);
  }

  async set(key, data) {
    // This could be stored anywhere, like durable storage
    cache.set(key, data);
  }
};
