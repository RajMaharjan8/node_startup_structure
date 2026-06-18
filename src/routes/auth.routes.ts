import express from "express";
import {
  login,
  register,
  resendOtp,
  verifyOtp,
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import {
  loginSchema,
  registerSchema,
  resendOtpSchema,
  verifyOtpSchema,
} from "../validations/auth.validation";
const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

export default router;
