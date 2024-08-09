import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import UserRoutes from "./routes/users";
import CardRoutes from "./routes/cards";
import { INTERNAL_SERVER_ERROR_CODE } from "./constants";
import { requestLogger, errorLogger } from "./middlewares/logger";
import { errors } from "celebrate";
import { UnautharizedError } from "./errors";

declare module "express-serve-static-core" {
  interface Request {
    user: { _id: string };
  }
}

const { PORT = 3000, dbUrl = "mongodb://localhost:27017/mestodb" } =
  process.env;

mongoose.connect(dbUrl);

const app = express();
app.use(express.json());

app.use(requestLogger);
app.use(UserRoutes);
app.use(CardRoutes);

app.get("*", function (req, res) {
  res.status(404).send({ message: "404 not found" });
});

app.use(errorLogger);
app.use(errors());
app.use(
  (
    err: UnautharizedError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ) => {
    const { statusCode = INTERNAL_SERVER_ERROR_CODE, message } = err;
    res.status(statusCode).send({
      message:
        statusCode === INTERNAL_SERVER_ERROR_CODE
          ? "На сервере произошла ошибка"
          : message,
    });
  },
);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
