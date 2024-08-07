import { Router } from "express";
import {
  getAllUsers,
  getSingleUser,
  createUser,
  updateMyUser,
  updateMyUserAvatar,
  login,
  getMyUser,
} from "../controllers/users";
import { Auth } from "../middlewares/auth";
import { celebrate, Joi } from "celebrate";
import { urlRegExp } from "../constants";

const router = Router();

const loginValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const fullUserValidationSchema = {
  body: Joi.object().keys({
    email: Joi.string(),
    password: Joi.string(),
    name: Joi.string().min(2).max(20),
    about: Joi.string().min(2).max(200),
    avatar: Joi.string().regex(urlRegExp),
  }),
};

router.post("/signin", celebrate(loginValidationSchema), login);

router.post("/signup", celebrate(fullUserValidationSchema), createUser);

router.use(Auth);

router.get("/users", getAllUsers);

router.get("/users/me", getMyUser);

router.get("/users/:userId", getSingleUser);

router.post("/users", celebrate(fullUserValidationSchema), createUser);

router.patch("/users/me", celebrate(fullUserValidationSchema), updateMyUser);

router.patch(
  "/users/me/avatar",
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().regex(urlRegExp),
    }),
  }),
  updateMyUserAvatar,
);

export default router;
