import express from "express";
import { validate } from "../../middlewares/validate";
import { updateOrderStatusSchema } from "../../validations/order.validation";
import {
  allOrders,
  showOrder,
  changeOrderStatus,
} from "../../controllers/order.controller";
import {
  confirmCodPayment,
  transactionHistory,
} from "../../controllers/payment.controller";

const router = express.Router();

router.get("/transactions", transactionHistory);
router.get("/", allOrders);
router.get("/:id", showOrder);
router.put("/:id/status", validate(updateOrderStatusSchema), changeOrderStatus);
router.post("/:id/confirm-cod", confirmCodPayment);

export default router;
