import prisma from "../db/config";
import { Prisma } from "../../generated/prisma/client";

export const getUserData = async (
  page: number,
  perPage: number,
  skip: number,
  keyword: string | null,
  sortBy: Prisma.SortOrder,
) => {
  const where: Prisma.UserWhereInput = keyword
    ? {
        OR: [
          {
            name: {
              contains: keyword,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,

      skip,
      take: perPage,
      orderBy: {
        created_at: sortBy,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return { users, total };
};
