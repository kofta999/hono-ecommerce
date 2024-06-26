import { z } from "@hono/zod-openapi";

// TODO: Keep sizes in sync somehow

export const SizeZodSchema = z.union([
  z.literal("SMALL"),
  z.literal("MEDIUM"),
  z.literal("L"),
  z.literal("XL"),
  z.literal("XXL"),
  z.literal("XXXL"),
]);

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string(),
  rate: z.number(),

  sizes: z.array(SizeZodSchema).optional(),
  description: z.string().optional(),
  colors: z.array(z.string()).optional(),

  discountedPrice: z.number().optional(),
  quantity: z.number().optional(),
  categoryId: z.number(),
});

export type Product = z.infer<typeof ProductSchema>;
