import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { admin } from "../../middlewares/admin";
import AdminItemRoutes from "./item.routes";
import AdminPackageRoutes from "./package.routes";
import AdminInventoryRoutes from "./inventory.routes";
import AdminOrderRoutes from "./order.routes";
import MediaRoutes from "../media.routes";

const router = Router();

router.use(auth, admin);

router.use("/items", AdminItemRoutes);
router.use("/packages", AdminPackageRoutes);
router.use("/inventory", AdminInventoryRoutes);
router.use("/orders", AdminOrderRoutes);
router.use("/media", MediaRoutes);

export default router;
