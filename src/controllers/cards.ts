/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import Card from "../models/card";
import {
  BAD_REQUEST_ERROR_CODE,
  MONGOOSE_CAST_ERROR,
  MONGOOSE_VALIDATION_ERROR,
  NOT_FOUND_ERROR_CODE,
} from "../constants";

export const getAllCards = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch((err) => next(err));
};

export const createCard = (req: Request, res: Response, next: NextFunction) => {
  const requestUserId = (req as any).user._id;

  Card.create({ ...req.body, owner: requestUserId })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === MONGOOSE_VALIDATION_ERROR) {
        err.statusCode = BAD_REQUEST_ERROR_CODE;
        err.message = "Переданы некорректные данные при создании карточки";
      }

      next(err);
    });
};

export const deleteCard = (
  req: Request<{ cardId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const requestUserId = (req as any).user._id;

  Card.findByIdAndDelete({ _id: req.params.cardId, owner: requestUserId })
    .then(() => {
      res.send("Карточка удалена");
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такой карточки не существует";
      }
      next(err);
    });
};

export const likeCard = (req: Request, res: Response, next: NextFunction) =>
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: (req as any).user._id } },
    { new: true },
  )
    .then(() => {
      res.send("Лайк поставлен");
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такой карточки не существует";
      }
      next(err);
    });

export const dislikeCard = (req: Request, res: Response, next: NextFunction) =>
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: (req as any).user._id } },
    { new: true },
  )
    .then(() => {
      res.send("Лайк удален");
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        err.statusCode = NOT_FOUND_ERROR_CODE;
        err.message = "Такой карточки не существует";
      }
      next(err);
    });
