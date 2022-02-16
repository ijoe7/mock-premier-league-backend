import dotenv from "dotenv"
import "./config/mongoose"
import app from "./app";
dotenv.config();

Error.stackTraceLimit = 2;
const port = process.env.PORT || 1200;

process.on("uncaughtException", (err: Error) => {
  console.log(
    "Uncaught Exception!! Shutting down process..",
    err.name,
    err.message,
    err.stack
  );
  process.exit(1);
});

app.listen(port, () => {
  console.log("App running on Port:", port);
});

process.on("unhandledRejection", (err: Error) => {
  console.log(
    "Unhandled Rejection!!",
    err.name,
    err.message,
    err.stack
  );
  process.exit(1);
});
