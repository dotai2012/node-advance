const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const { redisURL } = require('../config/keys');

const client = redis.createClient(redisURL);
client.hget = util.promisify(client.hget);
const { exec } = mongoose.Query.prototype;

mongoose.Query.prototype.cache = function (option = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(option.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (this.useCache) {
    const key = JSON.stringify(Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name }));
    const cache = await client.hget(this.hashKey, key);
    if (cache) {
      const doc = JSON.parse(cache);
      return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }
    const result = await exec.apply(this, arguments);
    client.hset(this.hashKey, key, JSON.stringify(result));
    client.expire(this.hashKey, 60 * 60 * 24);
    return result;
  }
  return exec.apply(this, arguments);
};
module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
  flushAll() {
    client.flushall();
  },
};
