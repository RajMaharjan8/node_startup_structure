import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import React from "react";
import OtpEmail from "../emails/OtpEmail";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpMail = async (to: string, otp: string) => {
  const html = await render(React.createElement(OtpEmail, { otp }));

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Your verification code",
    html,
  });
};
