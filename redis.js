const redis = require('redis');

const client = redis.createClient('redis://192.168.99.100:6379');

client.on('ready', () => {
  console.log('Redis running');
})
;