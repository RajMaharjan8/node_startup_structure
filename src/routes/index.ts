import { Router } from "express";
import UserRoutes from "./user.routes.ts";
import AuthRoutes from "./auth.routes.ts";
import MediaRoutes from "./media.routes.ts";
import ItemRoutes from "./item.routes.ts";
import PackageRoutes from "./package.routes.ts";
import CartRoutes from "./cart.routes.ts";
import OrderRoutes from "./order.routes.ts";
import AdminRoutes from "./admin/index.ts";

const router = Router();

// customer
router.use("/api/auth", AuthRoutes);
router.use("/api/users", UserRoutes);
router.use("/api/media", MediaRoutes);
router.use("/api/items", ItemRoutes);
router.use("/api/packages", PackageRoutes);
router.use("/api/cart", CartRoutes);
router.use("/api/orders", OrderRoutes);

// admin
router.use("/api/admin", AdminRoutes);

export default router;
