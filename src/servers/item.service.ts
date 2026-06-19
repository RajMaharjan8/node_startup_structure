import prisma from "../db/config";
import { Prisma } from "../../generated/prisma/client";

export const getItems = async (
  perPage: number,
  skip: number,
  keyword: string | null,
  sortBy: Prisma.SortOrder,
  activeOnly: boolean,
) => {
  const where: Prisma.ItemWhereInput = {
    ...(activeOnly ? { is_active: true } : {}),
    ...(keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: sortBy },
    }),
    prisma.item.count({ where }),
  ]);

  return { items, total };
};

export const findItem = (id: number) =>
  prisma.item.findUnique({ where: { id } });

export const createItem = (data: Prisma.ItemCreateInput) =>
  prisma.item.create({ data });

export const updateItem = (id: number, data: Prisma.ItemUpdateInput) =>
  prisma.item.update({ where: { id }, data });

export const deleteItem = (id: number) =>
  prisma.item.delete({ where: { id } });
