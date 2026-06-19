import express from "express";
import { validate } from "../../middlewares/validate";
import {
  createPackageSchema,
  updatePackageSchema,
} from "../../validations/package.validation";
import {
  getPackagesAdmin,
  showPackage,
  storePackage,
  editPackage,
  removePackage,
} from "../../controllers/package.controller";

const router = express.Router();

router.get("/", getPackagesAdmin);
router.get("/:id", showPackage);
router.post("/", validate(createPackageSchema), storePackage);
router.put("/:id", validate(updatePackageSchema), editPackage);
router.delete("/:id", removePackage);

export default router;
