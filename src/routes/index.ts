import { Router } from "express";
import UserRoutes from "./user.routes.ts";
import AuthRoutes from "./auth.routes.ts";

const router = Router();

router.use("/api/auth", AuthRoutes);
router.use("/api/users", UserRoutes);

export default router;
