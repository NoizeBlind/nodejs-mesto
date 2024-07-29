import { Router } from "express";
import {
  getAllUsers,
  getSingleUser,
  createUser,
  updateMyUser,
  updateMyUserAvatar,
} from "../controllers/users";

const router = Router();

router.get("/users", getAllUsers);

router.get("/users/:userId", getSingleUser);

router.post("/users", createUser);

router.patch("/users/me", updateMyUser);

router.patch("/users/me/avatar", updateMyUserAvatar);

export default router;
