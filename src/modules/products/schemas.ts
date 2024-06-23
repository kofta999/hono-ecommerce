import { z } from "zod";

// TODO: Add support for more than a category etc
export const productsQuerySchema = z.object({
  page: z
    .string()
    .refine((v) => !isNaN(Number(v)), "Page must be a number")
    .optional(),
  perPage: z
    .string()
    .refine((v) => !isNaN(Number(v)), "Items per page must be a number")
    .optional(),
  categoryId: z
    .string()
    .refine((v) => !isNaN(Number(v)), "Category id must be a number")
    .optional(),
  q: z.string().optional(),
  minPrice: z
    .string()
    .refine((v) => !isNaN(Number(v)), "Minimum price must be a number")
    .optional(),
  maxPrice: z
    .string()
    .refine((v) => !isNaN(Number(v)), "Maximum price must be a number")
    .optional(),
});
