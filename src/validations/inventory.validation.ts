import { z } from "zod";

export const stockMovementSchema = z.object({
  change: z.number().int().refine((v) => v !== 0, "Change cannot be zero"),
  reason: z.enum(["RESTOCK", "PURCHASE", "ADJUST"]),
  note: z.string().optional(),
});
