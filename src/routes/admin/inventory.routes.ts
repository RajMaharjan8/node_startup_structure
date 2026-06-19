import express from "express";
import { validate } from "../../middlewares/validate";
import { stockMovementSchema } from "../../validations/inventory.validation";
import {
  adjustItemStock,
  stockMovements,
  lowStockItems,
} from "../../controllers/inventory.controller";

const router = express.Router();

router.get("/movements", stockMovements);
router.get("/low-stock", lowStockItems);
router.post("/:id/adjust", validate(stockMovementSchema), adjustItemStock);

export default router;
