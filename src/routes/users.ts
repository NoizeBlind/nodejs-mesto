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

const router = Router();

router.post("/signin", login);

router.post("/signup", createUser);

router.use(Auth);

router.get("/users", getAllUsers);

router.get("/users/me", getMyUser);

router.get("/users/:userId", getSingleUser);

router.post("/users", createUser);

router.patch("/users/me", updateMyUser);

router.patch("/users/me/avatar", updateMyUserAvatar);

export default router;
