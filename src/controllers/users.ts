/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import User from "../models/user";
import {
  BAD_REQUEST_ERROR_CODE,
  MONGOOSE_CAST_ERROR,
  MONGOOSE_VALIDATION_ERROR,
  NOT_FOUND_ERROR_CODE,
} from "../constants";
import { BadRequestError } from "../errors";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";

const { jwtKey = "some-secret-key" } = process.env;

export const getAllUsers = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => next(err));
};

export const getSingleUser = (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
) => {
  User.findOne({ _id: req.params.userId })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такого пользователя не существует";
      }

      next(err);
    });
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const emailValid = validator.isEmail(req.body.email || "");
  const passwordExists = Boolean(req.body.password);

  if (!emailValid || !passwordExists) {
    const err = new BadRequestError(
      "Переданы некорректные данные при создании пользователя",
    );
    next(err);

    return;
  }

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({ ...req.body, password: hash }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === MONGOOSE_VALIDATION_ERROR) {
        err.statusCode = BAD_REQUEST_ERROR_CODE;
        err.message = "Переданы некорректные данные при создании пользователя";
      }

      next(err);
    });
};

export const getMyUser = (req: Request, res: Response, next: NextFunction) => {
  const requestUserId = (req as any).user._id;

  User.findOne({ _id: requestUserId }, { ...req.body })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такого пользователя не существует";
      }

      next(err);
    });
};

export const updateMyUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestUserId = (req as any).user._id;

  User.updateOne({ _id: requestUserId }, { ...req.body })
    .then((result) => {
      if (!result.acknowledged) {
        throw new BadRequestError("Неверные поля для обновления");
      } else res.send("Пользователь обновлен");
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такого пользователя не существует";
      }
      next(err);
    });
};

export const updateMyUserAvatar = (
  req: Request<object, object, { avatar: string }>,
  res: Response,
  next: NextFunction,
) => {
  const requestUserId = (req as any).user._id;

  User.updateOne({ _id: requestUserId }, { avatar: req.body.avatar })
    .then((result) => {
      if (!result.acknowledged) {
        throw new BadRequestError("Неверные поля для обновления");
      } else res.send("Пользователь обновлен");
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такого пользователя не существует";
      }
      next(err);
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  let foundedUser: any;

  return User.findOne({ email })
    .select("+password")
    .then((user) => {
      foundedUser = user;
      if (!user) {
        const err = new BadRequestError(
          "Переданы некорректные данные при логине пользователя",
        );
        next(err);
        return;
      }

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        const err = new BadRequestError(
          "Переданы некорректные данные при логине пользователя",
        );
        next(err);
        return;
      }

      const token = jwt.sign({ _id: foundedUser._id }, jwtKey, {
        expiresIn: "30d",
      });

      res.send({ token });
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такого пользователя не существует";
      }

      next(err);
    });
};
