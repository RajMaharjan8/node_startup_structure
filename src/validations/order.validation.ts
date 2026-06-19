import { z } from "zod";

const orderLine = z
  .object({
    item_id: z.number().int().optional(),
    package_id: z.number().int().optional(),
    quantity: z.number().int().positive(),
  })
  .refine((d) => d.item_id || d.package_id, {
    message: "item_id or package_id is required",
  });

export const checkoutSchema = z.object({
  payment_method: z.enum(["COD", "ESEWA", "KHALTI"]),
  address: z.string({ error: "Address is required" }).min(3),
  phone: z.string({ error: "Phone is required" }).min(7),
  note: z.string().optional(),
  // omit lines to checkout from the saved cart; pass lines for a custom/direct order
  lines: z.array(orderLine).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED", "COMPLETED"]),
});
