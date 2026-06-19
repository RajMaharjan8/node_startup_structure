import express from "express";
import {
  getPackagesPublic,
  showPackage,
} from "../controllers/package.controller";

const router = express.Router();

router.get("/", getPackagesPublic);
router.get("/:id", showPackage);

export default router;
