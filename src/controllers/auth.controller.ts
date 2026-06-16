import { Request, Response } from "express";
import { sendResponse } from "../helpers/api-response";
import prisma from "../db/config";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefresToken } from "../helpers/jwt";
import { UserResponse } from "../resources/user.resource";


export const login = async(req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return sendResponse(res, "User Not Found!", [], 404);
    }
    if(!bcrypt.compareSync(req.body.password, user.password)){
        return sendResponse(
            res,
            "Password is incorrect",
            [],
            400
        )
    }

    const payload ={
        id: user.id,
        email: user.email
    };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefresToken(payload);
    const data = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: UserResponse(user)
    };

    return sendResponse(
        res,
        "Authenticated Successfully",
        data,
        200
    );

  } catch (err: any) {
    console.log(err);
    return sendResponse(res, "Something Went Wrong", [], 500);
  }
};
