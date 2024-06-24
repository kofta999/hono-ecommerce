import { z } from "zod";

export const PaginationSchema = z.object({
  page: z.number(),
  perPage: z.number(),
  total: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const SuccessResponseSchema = z.object({
  success: z.literal<boolean>(true),
  message: z.string(),
  data: z.unknown().optional(),
  pagination: PaginationSchema.optional(),
});

export const FailureResponseSchema = z.object({
  success: z.literal<boolean>(false),
  message: z.string(),
  cause: z.unknown().optional(),
});
