import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../helpers/api-response";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) {
    return sendResponse(res, "Unauthorized Action.", [], 403);
  }
  const token = header.split(" ")[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
   
    req.user = decode;
    next();
  } catch (err: any) {
    console.log(err);
    return sendResponse(res, "Something Went Wrong", [], 500);
  }
};
