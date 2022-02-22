// import * as redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from 'redis';

     
let client = createClient({
  url: process.env.REDIS_URL
});
if (!process.env.REDIS_URL) {
  client = createClient({
    url: "redis://:pa6881ac048779148a15338d77bc3a29e38f124ac415b2edcc36e3922e1c56b92@ec2-34-206-217-83.compute-1.amazonaws.com:7879",
  });
}
// if (process.env.REDISTOGO_URL) {
//   let redisURL: any = process.env.REDISTOGO_URL;
//   client = createClient(redisURL);
//   console.log("Using Redis To Go");
// } else {
//   client = createClient();
//   console.log("Using Local Redis");
// };

// const client = createClient();

// let redisURL: any = process.env.REDISTOGO_URL;
// let client = createClient(redisURL);

(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("::> Redis Client Connected"));
client.on("error", (err) => console.log("<:: Redis Client Error", err));

export default client;