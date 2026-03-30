import { z } from "zod";

export const orderItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.string().transform((v) => parseFloat(v)),
});

export const orderSchema = z.object({
  enquiryId: z.string().optional(),
  status: z.enum(["draft", "quote", "confirmed", "cancelled", "completed"]),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
