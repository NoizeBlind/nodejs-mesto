/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import UserRoutes from "./routes/users";
import CardRoutes from "./routes/cards";
import { INTERNAL_SERVER_ERROR_CODE } from "./constants";
import { requestLogger, errorLogger } from "./middlewares/logger";
import { errors } from "celebrate";

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
app.use(errors()); // обработчик ошибок celebrate
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const { statusCode = INTERNAL_SERVER_ERROR_CODE, message } = err;
  res.status(statusCode).send({
    message:
      statusCode === INTERNAL_SERVER_ERROR_CODE
        ? "На сервере произошла ошибка"
        : message,
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
