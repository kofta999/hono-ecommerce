import { z } from "@hono/zod-openapi";
import { ProductSchema, SizeZodSchema } from "../products/types";

const OperationEnum = z.enum(["inc", "dec", "del"]);

export const MutateCartSchema = z.object({
  productId: z.number(),
  quantity: z.number(),
  size: SizeZodSchema,
  color: z.string(),
  type: OperationEnum,
});

const CartProductSchema = ProductSchema.omit({
  description: true,
  quantity: true,
  rate: true,
  categoryId: true,
  sizes: true,
  colors: true,
});

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  product: CartProductSchema,
});

export const CartSchema = z.object({
  id: z.number(),
  userId: z.string(),
  cartItems: z.array(CartItemSchema)
})

export type CartProduct = z.infer<typeof CartProductSchema>;
