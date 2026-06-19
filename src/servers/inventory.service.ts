import prisma from "../db/config";
import { StockReason } from "../../generated/prisma/client";

export const adjustStock = (
  itemId: number,
  change: number,
  reason: StockReason,
  note: string | null,
) =>
  prisma.$transaction([
    prisma.item.update({
      where: { id: itemId },
      data: { stock_qty: { increment: change } },
    }),
    prisma.stockMovement.create({
      data: { item_id: itemId, change, reason, note },
    }),
  ]);

export const getMovements = async (
  itemId: number | null,
  perPage: number,
  skip: number,
) => {
  const where = itemId ? { item_id: itemId } : {};
  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: { item: { select: { id: true, name: true } } },
    }),
    prisma.stockMovement.count({ where }),
  ]);
  return { movements, total };
};

export const lowStock = (threshold: number) =>
  prisma.item.findMany({
    where: { stock_qty: { lte: threshold }, is_active: true },
    orderBy: { stock_qty: "asc" },
  });
