import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../helpers/api-response";
import prisma from "../db/config";

export const admin = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.user as JwtPayload | undefined;
  if (!payload?.id) {
    return sendResponse(res, "Unauthorized Action.", [], 403);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || user.role !== "ADMIN") {
    return sendResponse(res, "Admin access only.", [], 403);
  }

  next();
};
