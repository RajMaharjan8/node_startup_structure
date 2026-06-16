import { createUser, getUsers, updateUser } from "../controllers/user.controller";
import express from "express";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema } from "../validations/user.validation";
import { auth } from "../middlewares/auth";

const router = express.Router();

router.get('/',auth,getUsers);
router.post("/", validate(createUserSchema),createUser)
router.put("/:id",validate(updateUserSchema),updateUser);


export default router
