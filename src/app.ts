import express, { Request, Response, NextFunction } from "express";
const app = express();
import bodyParser from "body-parser";
import cors from "cors";
import { HttpError } from "http-errors";

const options: cors.CorsOptions = {
    origin: "*",
};
app.use(cors(options));
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// app.use("/");

app.use("/", (req: Request, res: Response) => {
  res.send("Hello, Welcome to the Mock Premier League API");
});

// error handler
app.use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
