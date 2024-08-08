import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnautharizedError } from "../errors";

const { JWT_SECRET = "some-secret-key" } = process.env;

export const Auth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    next(new UnautharizedError("Необходима авторизация"));
    return;
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new UnautharizedError("Необходима авторизация"));
  }

  req.user = (payload as JwtPayload)._id;

  next();
};
