import { z } from "zod";

const packageItem = z.object({
  item_id: z.number().int(),
  quantity: z.number().int().positive().optional(),
});

export const createPackageSchema = z.object({
  name: z.string({ error: "Name is required" }).min(2),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  discount_price: z.number().nonnegative().optional(),
  thumbnail_id: z.number().int().optional(),
  items: z.array(packageItem).min(1, "Add at least one item"),
});

export const updatePackageSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  discount_price: z.number().nonnegative().optional(),
  thumbnail_id: z.number().int().optional(),
  is_active: z.boolean().optional(),
  items: z.array(packageItem).optional(),
});
