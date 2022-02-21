// import * as redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from 'redis';


let redisURL: any = process.env.REDISTOGO_URL;
let client = createClient(redisURL);
// if (process.env.REDISTOGO_URL) {
//   client = createClient(redisURL);
// }
// const client = createClient();
(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("::> Redis Client Connected"));
client.on("error", (err) => console.log("<:: Redis Client Error", err));

export default client;