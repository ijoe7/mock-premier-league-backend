// import * as redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from 'redis';


let client;
if (process.env.REDISTOGO_URL) {
  let redisURL: any = process.env.REDISTOGO_URL;
  client = createClient(redisURL);
} else {
  client = createClient();
}
// const client = createClient();
(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("::> Redis Client Connected"));
client.on("error", (err) => console.log("<:: Redis Client Error", err));

export default client;