/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import UserRoutes from "./routes/users";
import CardRoutes from "./routes/cards";
import { INTERNAL_SERVER_ERROR_CODE } from "./constants";

const { PORT = 3000 } = process.env;
const FAKE_AUTH_USER_ID = "66a7cd616daf6b48d576b5d6";

mongoose.connect("mongodb://localhost:27017/mestodb");

const app = express();
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).user = {
    _id: FAKE_AUTH_USER_ID,
  };

  next();
});

app.use(UserRoutes);
app.use(CardRoutes);

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
