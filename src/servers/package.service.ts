import prisma from "../db/config";
import { Prisma } from "../../generated/prisma/client";

const include = { items: { include: { item: true } } };

export const getPackages = async (
  perPage: number,
  skip: number,
  keyword: string | null,
  sortBy: Prisma.SortOrder,
  activeOnly: boolean,
) => {
  const where: Prisma.PackageWhereInput = {
    ...(activeOnly ? { is_active: true } : {}),
    ...(keyword
      ? { name: { contains: keyword, mode: "insensitive" } }
      : {}),
  };

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { created_at: sortBy },
      include,
    }),
    prisma.package.count({ where }),
  ]);

  return { packages, total };
};

export const findPackage = (id: number) =>
  prisma.package.findUnique({ where: { id }, include });

type PkgItem = { item_id: number; quantity?: number };

export const createPackage = (
  data: Omit<Prisma.PackageCreateInput, "items">,
  items: PkgItem[],
) =>
  prisma.package.create({
    data: {
      ...data,
      items: {
        create: items.map((i) => ({
          item_id: i.item_id,
          quantity: i.quantity ?? 1,
        })),
      },
    },
    include,
  });

export const updatePackage = async (
  id: number,
  data: Prisma.PackageUpdateInput,
  items?: PkgItem[],
) => {
  // replace item set when items are provided
  if (items) {
    await prisma.packageItem.deleteMany({ where: { package_id: id } });
    await prisma.packageItem.createMany({
      data: items.map((i) => ({
        package_id: id,
        item_id: i.item_id,
        quantity: i.quantity ?? 1,
      })),
    });
  }
  return prisma.package.update({ where: { id }, data, include });
};

export const deletePackage = (id: number) =>
  prisma.package.delete({ where: { id } });
