import { z } from "zod";

export const createTableSchema = z.object({
  label: z.string().trim().min(1).max(40),
  capacity: z.number().int().min(1).max(50).default(4),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;

export const updateTableSchema = z.object({
  label: z.string().trim().min(1).max(40).optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  status: z.enum(["empty", "occupied", "reserved"]).optional(),
});

export type UpdateTableInput = z.infer<typeof updateTableSchema>;
