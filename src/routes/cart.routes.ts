import express from "express";
import { auth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  addCartSchema,
  updateCartItemSchema,
} from "../validations/cart.validation";
import {
  showCart,
  addCart,
  updateCart,
  removeCart,
  emptyCart,
} from "../controllers/cart.controller";

const router = express.Router();

router.use(auth);

router.get("/", showCart);
router.post("/", validate(addCartSchema), addCart);
router.put("/:id", validate(updateCartItemSchema), updateCart);
router.delete("/:id", removeCart);
router.delete("/", emptyCart);

export default router;
