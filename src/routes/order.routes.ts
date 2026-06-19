import express from "express";
import { auth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { checkoutSchema } from "../validations/order.validation";
import {
  checkout,
  myOrders,
  showMyOrder,
} from "../controllers/order.controller";
import {
  initiatePayment,
  paymentCallback,
} from "../controllers/payment.controller";

const router = express.Router();

// gateway callback is public (hit by eSewa/Khalti servers)
router.get("/payment/callback", paymentCallback);
router.post("/payment/callback", paymentCallback);

router.use(auth);

router.post("/checkout", validate(checkoutSchema), checkout);
router.get("/", myOrders);
router.get("/:id", showMyOrder);
router.post("/:id/pay", initiatePayment);

export default router;
