import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export const generateOtp = (length: number) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  return Math.floor(min + Math.random() * (max - min)).toString();
};

export const authId = (req: Request): number =>
  (req.user as JwtPayload).id;


