import mongoose from "mongoose";
import {truncateSync} from "fs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Enter a valid username"],
      unique: [true, "username in use"],
    },
    email: {
      type: String,
      required: [true, "Enter a valid email"],
      unique: [true, "Email already exists"],
      trim: truncateSync,
    },
    password: {
      type: String,
      required: [true, "Enter a valid password"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("user", userSchema);
