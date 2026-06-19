import express from "express";
import { getItemsPublic, showItem } from "../controllers/item.controller";

const router = express.Router();

router.get("/", getItemsPublic);
router.get("/:id", showItem);

export default router;
