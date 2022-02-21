import mongoose, { connect, connection } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";


let mongoServer: MongoMemoryServer;

// For mongodb-memory-server's old version (< 7) use this instead:
// const mongoServer = new MongoMemoryServer();

const opts: Record<string, any> = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Provide connection to a new in-memory database server.
export const dbConnect = async () => {
  // NOTE: before establishing a new connection close previous
  await mongoose.disconnect();

  mongoServer = await MongoMemoryServer.create();

  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, opts, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(" MongoDB Memory Server connected");
    }
  });
};

// Remove and close the database and server.
export const dbDisconnect = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clear = async () => {
  const collections: any = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
};