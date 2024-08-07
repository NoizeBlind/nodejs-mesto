/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import Card from "../models/card";
import { MONGOOSE_CAST_ERROR, MONGOOSE_VALIDATION_ERROR } from "../constants";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors";

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
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === MONGOOSE_VALIDATION_ERROR) {
        next(
          new BadRequestError(
            "Переданы некорректные данные при создании карточки",
          ),
        );
        return;
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

  Card.deleteOne({ _id: req.params.cardId, owner: requestUserId })
    .then((result) => {
      console.log(result);
      if (!result.deletedCount) {
        const err = new ForbiddenError(
          "Недостаточно прав для удаления карточки",
        );
        next(err);
        return;
      }
      res.send({ message: "Карточка удалена" });
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        next(new NotFoundError("Такой карточки не существует"));
        return;
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
      res.send({ message: "Лайк поставлен" });
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        next(new NotFoundError("Такой карточки не существует"));
        return;
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
      res.send({ message: "Лайк удален" });
    })
    .catch((err) => {
      if (err.name === MONGOOSE_CAST_ERROR) {
        next(new NotFoundError("Такой карточки не существует"));
        return;
      }
      next(err);
    });
