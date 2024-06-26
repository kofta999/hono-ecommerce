import { z } from "@hono/zod-openapi";

export const getUserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const addAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  country: z.string(),
  phoneNumber: z.string(),
});

export const getAddressSchema = addAddressSchema.extend({
  id: z.number(),
  addressLine2: z.union([z.string(), z.null()]),
});
