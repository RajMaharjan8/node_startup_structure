import { Request, Response } from "express";
import { sendResponse, sendResponseFail } from "../helpers/api-response";
import prisma from "../db/config";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefresToken } from "../helpers/jwt";
import { UserResponse } from "../resources/user.resource";
import { generateOtp } from "../helpers";
import { sendOtpMail } from "../servers/email.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, address, phone } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        phone,
        password: hashPassword,
        address,
        has_email_verified: false,
      },
    });

    const otpCode = generateOtp(5);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otp.create({
      data: {
        user_id: user.id,
        code: otpCode,
        purpose: "EMAIL_VERIFICATION",
        expires_at: expiresAt,
      },
    });

    try {
      await sendOtpMail(email, otpCode);
    } catch (mailErr: any) {
      return sendResponseFail(
        res,
        "Account created but we couldn't send the OTP email. Please use resend OTP.",
        { email },
        502,
      );
    }

    return sendResponse(
      res,
      "An OTP has been sent to your email. Please verify your account to register successfully",
      [],
      201,
    );
  } catch (err: any) {
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return sendResponse(res, "User Not Found!", [], 404);
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return sendResponse(res, "Password is incorrect", [], 400);
    }
    if(!user.has_email_verified){
      return sendResponse(res, "Please verify your account", [], 400);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefresToken(payload);
    const data = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: UserResponse(user),
    };

    return sendResponse(res, "Authenticated Successfully", data, 200);
  } catch (err: any) {
    console.log(err);
    return sendResponse(res, "Something Went Wrong", [], 500);
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return sendResponse(res, "User Not Found!", [], 404);
    }
    if (user.has_email_verified) {
      return sendResponse(res, "Email is already verified", [], 400);
    }

    await prisma.otp.deleteMany({
      where: {
        user_id: user.id,
        purpose: "EMAIL_VERIFICATION",
      },
    });

    const otpCode = generateOtp(5);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await prisma.otp.create({
      data: {
        user_id: user.id,
        code: otpCode,
        purpose: "EMAIL_VERIFICATION",
        expires_at: expiresAt,
      },
    });

    try {
      await sendOtpMail(email, otpCode);
    } catch (mailErr: any) {
      return sendResponseFail(
        res,
        "Failed to send OTP email. Please try again.",
        { email },
        502,
      );
    }

    return sendResponse(res, "A new OTP has been sent to your email", [], 200);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return sendResponse(res, "User Not Found!", [], 404);
    }
    if (user.has_email_verified) {
      return sendResponse(res, "Email is already verified", [], 400);
    }

    const otpRecord = await prisma.otp.findFirst({
      where: {
        user_id: user.id,
        code: otp,
        purpose: "EMAIL_VERIFICATION",
      },
    });

    if (!otpRecord) {
      return sendResponse(res, "Invalid OTP", [], 400);
    }

    if (otpRecord.expires_at < new Date()) {
      await prisma.otp.delete({ where: { id: otpRecord.id } });
      return sendResponse(res, "OTP has expired. Please request a new one", [], 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { has_email_verified: true },
      }),
      prisma.otp.deleteMany({
        where: { user_id: user.id, purpose: "EMAIL_VERIFICATION" },
      }),
    ]);

    return sendResponse(res, "Email verified successfully", [], 200);
  } catch (err: any) {
    console.log(err);
    return sendResponseFail(res, "Something Went Wrong", {}, 500);
  }
};
