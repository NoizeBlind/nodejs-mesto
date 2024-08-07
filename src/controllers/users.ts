/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import User from "../models/user";
import { MONGOOSE_CAST_ERROR, MONGOOSE_VALIDATION_ERROR } from "../constants";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import bcrypt from "bcrypt";
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
        next(new NotFoundError("Такого пользователя не существует"));
        return;
      }

      next(err);
    });
};

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  let passwordHash: string;
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      passwordHash = hash;
      return User.findOne({ email: req.body.email });
    })
    .then((user) => {
      if (user) {
        throw new ConflictError("Пользователь с такой почтой уже существует");
      }
      return User.create({ ...req.body, password: passwordHash });
    })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === MONGOOSE_VALIDATION_ERROR) {
        next(
          new BadRequestError(
            "Переданы некорректные данные при создании пользователя",
          ),
        );
        return;
      }

      next(err);
    });
};

export const getMyUser = (req: Request, res: Response, next: NextFunction) => {
  const requestUserId = (req as any).user._id;

  User.findOne({ _id: requestUserId })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        next(new NotFoundError("Такого пользователя не существует"));
        return;
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
      } else res.send({ message: "Пользователь обновлен" });
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        next(new NotFoundError("Такого пользователя не существует"));
        return;
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
      } else res.send({ message: "Пользователь обновлен" });
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        next(new NotFoundError("Такого пользователя не существует"));
        return;
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
        next(new NotFoundError("Такого пользователя не существует"));
        return;
      }

      next(err);
    });
};
