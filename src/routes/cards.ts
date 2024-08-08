import { Router } from "express";
import {
  getAllCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} from "../controllers/cards";
import { celebrate, Joi, Segments } from "celebrate";

const router = Router();

router.get("/cards", getAllCards);

router.post(
  "/cards",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required(),
    }),
  }),
  createCard,
);

router.delete(
  "/cards/:cardId",
  deleteCard,
  celebrate({
    [Segments.PARAMS]: {
      cardId: Joi.string().required(),
    },
  }),
);

router.put(
  "/cards/:cardId/likes",
  likeCard,
  celebrate({
    [Segments.PARAMS]: {
      cardId: Joi.string().required(),
    },
  }),
);

router.delete(
  "/cards/:cardId/likes",
  dislikeCard,
  celebrate({
    [Segments.PARAMS]: {
      cardId: Joi.string().required(),
    },
  }),
);

export default router;
