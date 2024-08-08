import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/user";
import {
  MONGOOSE_CAST_ERROR,
  MONGOOSE_SERVER_ERROR,
  MONGOOSE_VALIDATION_ERROR,
} from "../constants";
import { BadRequestError, NotFoundError } from "../errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { JWT_SECRET = "some-secret-key" } = process.env;

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
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      return User.create({ ...req.body, password: hash });
    })
    .then(({ name, email, about, avatar }) => {
      res.status(201).send({
        name,
        email,
        about,
        avatar,
      });
    })
    .catch((err) => {
      if (err.name === MONGOOSE_VALIDATION_ERROR) {
        next(
          new BadRequestError(
            "Переданы некорректные данные при создании пользователя",
          ),
        );
        return;
      }
      if (err.name === MONGOOSE_SERVER_ERROR) {
        next(new BadRequestError("Email уже существует"));
        return;
      }

      next(err);
    });
};

export const getMyUser = (req: Request, res: Response, next: NextFunction) => {
  const requestUserId = req.user._id;

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
  const requestUserId = req.user._id;

  User.findOneAndUpdate({ _id: requestUserId }, { ...req.body }, { new: true })
    .then((result) => {
      if (!result) {
        throw new BadRequestError("Неверные поля для обновления");
      } else res.send(result);
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
  const requestUserId = req.user._id;

  User.findOneAndUpdate(
    { _id: requestUserId },
    { avatar: req.body.avatar },
    { new: true },
  )
    .then((result) => {
      if (!result) {
        throw new BadRequestError("Неверные поля для обновления");
      } else res.send(result);
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
  let foundedUser: IUser | null;

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

      const token = jwt.sign({ _id: foundedUser?._id }, JWT_SECRET, {
        expiresIn: "7d",
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
