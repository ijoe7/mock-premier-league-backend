// import * as redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from 'redis';

// const REDIS_PORT: any = process.env.PORT || 6379;
// const redisClient = redis.createClient({
    //     host: process.env.REDIS_HOST,
    //     port: REDIS_PORT,
    //     retry_strategy: () => 1000
    // });
    
const client = createClient();
(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("::> Redis Client Connected"));
client.on("error", (err) => console.log("<:: Redis Client Error", err));

export default client;