import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string({ error: "Name is required" }).min(2),
  price: z.number({ error: "Price is required" }).nonnegative(),
  discount_price: z.number().nonnegative().optional(),
  description: z.string().optional(),
  stock_qty: z.number().int().nonnegative().optional(),
  thumbnail_id: z.number().int().optional(),
});

export const updateItemSchema = createItemSchema.partial().extend({
  is_active: z.boolean().optional(),
});
