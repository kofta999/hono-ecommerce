import { createRoute, z } from "@hono/zod-openapi";
import { productsQuerySchema } from "./schemas";
import { genFailureResponse, genSuccessResponse } from "../../shared/utils";
import { ProductSchema } from "./types";

export const getProductsRoute = createRoute({
  tags: ["Products Management"],
  method: "get",
  path: "/",
  request: {
    query: productsQuerySchema,
  },
  responses: {
    200: {
      description: "Returns a list of products",
      content: {
        "application/json": {
          schema: genSuccessResponse(
            z.object({ products: z.array(ProductSchema) }),
            true
          ),
        },
      },
    },
  },
});

export const getProductRoute = createRoute({
  tags: ["Products Management"],
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Returns a list of products",
      content: {
        "application/json": {
          schema: genSuccessResponse(z.object({ product: ProductSchema })),
        },
      },
    },
    404: {
      description: "Product is not found",
      content: {
        "application/json": {
          schema: genFailureResponse(
            z.literal("Product was not found in the DB")
          ),
        },
      },
    },
  },
});
