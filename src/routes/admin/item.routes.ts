import express from "express";
import { validate } from "../../middlewares/validate";
import {
  createItemSchema,
  updateItemSchema,
} from "../../validations/item.validation";
import {
  getItemsAdmin,
  showItem,
  storeItem,
  editItem,
  removeItem,
} from "../../controllers/item.controller";

const router = express.Router();

router.get("/", getItemsAdmin);
router.get("/:id", showItem);
router.post("/", validate(createItemSchema), storeItem);
router.put("/:id", validate(updateItemSchema), editItem);
router.delete("/:id", removeItem);

export default router;
