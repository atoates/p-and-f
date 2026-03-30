import { z } from "zod";

export const enquirySchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientPhone: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().datetime().optional(),
  venueA: z.string().optional(),
  venueB: z.string().optional(),
  progress: z.enum(["New", "TBD", "Live", "Done", "Placed", "Order"]),
  notes: z.string().optional(),
});

export const enquiryFilterSchema = z.object({
  search: z.string().optional(),
  progress: z
    .enum(["New", "TBD", "Live", "Done", "Placed", "Order"])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryFilterInput = z.infer<typeof enquiryFilterSchema>;
