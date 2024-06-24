import { ZodSchema, ZodTypeAny, z } from "zod";
import {
  SuccessResponseSchema,
  FailureResponseSchema,
  PaginationSchema,
} from "./schemas";

export function genSuccessResponse<T extends ZodTypeAny>(
  data: T,
  pagination = false
) {
  const schema = SuccessResponseSchema.extend({ data });

  return pagination ? schema.extend({ pagination: PaginationSchema }) : schema;
}

export function genFailureResponse(cause: ZodSchema) {
  return FailureResponseSchema.extend({ cause });
}

export function calculatePagination(
  page: number,
  total: number,
  perPage: number
): z.infer<typeof PaginationSchema> {
  return {
    page,
    perPage,
    total,
    hasNextPage: page * perPage < total,
    hasPreviousPage: page > 1,
  };
}
