import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url: any  = process.env.DB_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log("DB connected...");
  })
  .catch((err) => {
    console.log("Error connecting DB!!", err.name, err.message);
  });

export default mongoose.connection;

// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// const app = express();

// app.use(cors());
// app.use(express.json());

// // const uri = process.env.ATLAS_URI!;

// const connectDB = async () => {
//   await mongoose
//     .connect(url)
//     .then(() => {
//       console.log("MongoDB database established successfully! Go nuts");
//     })
//     .catch((err) => {
//       console.error("Error connecting to Mongo", err);
//     });
// };
// export default connectDB;
