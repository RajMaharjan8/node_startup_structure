import { Request, Response } from "express";
import prisma from "../db/config.ts";
import { sendResponse } from "../helpers/api-response.ts";
import { UserResponse } from "../resources/user.resource.ts";
import { UserCollection } from "../resources/user.collection.ts";
import { getUserData } from "../servers/user.service.ts";
import bcrypt from "bcryptjs";


export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const perPage = Number(req.query.per_page ?? 10);
    const skip = (page - 1) * perPage;
    const keyword = String(req.query.keyword ?? "");
    const sortBy = req.query.sort_by === "asc" ? "asc" : "desc";

    const { users, total } = await getUserData(
      page,
      perPage,
      skip,
      keyword || null,
      sortBy,
    );

    return sendResponse(
      res,
      "User Fetched Successfully",
      UserCollection(users, {
        total,
        per_page: perPage,
        current_page: page,
        total_pages: Math.ceil(total / perPage),
      }),
      200,
    );
  } catch (err: any) {
    console.log(err);
    return sendResponse(res, "Something Went Wrong", [], 500);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const findUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (findUser) {
      return sendResponse(res, "Email Has Already Been Taken", [], 400);
    }
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashPassword,
      },
    });
    return sendResponse(
      res,
      "User Created Successfully",
      UserResponse(newUser),
      201,
    );
  } catch (err: any) {
    return sendResponse(res, err, [], 500);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return sendResponse(res, "User Not Found", [], 404);
    }

    const updateUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: req.body,
    });
    return sendResponse(
      res,
      "Successfully updated data!",
      UserResponse(updateUser),
      200,
    );
  } catch (err: any) {
    return sendResponse(res, err, [], 500);
  }
};
