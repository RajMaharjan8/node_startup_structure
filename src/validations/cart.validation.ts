import { z } from "zod";

export const addCartSchema = z
  .object({
    item_id: z.number().int().optional(),
    package_id: z.number().int().optional(),
    quantity: z.number().int().positive().optional(),
  })
  .refine((d) => d.item_id || d.package_id, {
    message: "item_id or package_id is required",
  });

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});
