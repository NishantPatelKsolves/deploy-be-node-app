// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: process.env.REDIS_URL,
// });

// redisClient.on("error", (err) => console.error("Redis Client Error", err));

// (async () => {
//   await redisClient.connect();
//   // console.log("Redis server up...");
//   // redisClient.ping().then(console.log);
// })();

// module.exports = redisClient;

// M2
const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});
// If needed, add connection timeouts or retries in createClient() for better production resilience.

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
  // optionally: throw here or let the promise reject on connect
});

async function connectRedis() {
  await redisClient.connect();
  await redisClient.ping();
  console.log("Connected to Redis and ping successful");
  // console.log(await redisClient.keys("*"));
}

module.exports = { redisClient, connectRedis };
