import { createRoute, z } from "@hono/zod-openapi";
import { CartItemSchema, CartSchema, MutateCartSchema } from "./schemas";
import { genFailureResponse, genSuccessResponse } from "../../shared/utils";
import { authorize } from "../../shared/middlewares/authorize";
import { ProductSchema } from "../products/types";
import { auth } from "firebase-admin";

export const mutateCart = createRoute({
  tags: ["Cart Management"],
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: MutateCartSchema,
        },
      },
    },
  },
  middleware: [authorize],
  security: [
    {
      Bearer: [],
    },
  ],

  responses: {
    200: {
      description: "Returns cart id",
      content: {
        "application/json": {
          schema: genSuccessResponse(z.object({ cartId: z.number() })),
        },
      },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: genFailureResponse(z.literal("Product not found")),
        },
      },
    },
  },
});

export const emptyCart = createRoute({
  tags: ["Cart Management"],
  method: "delete",
  path: "/{id}",
  request: {
    params: z.object({ id: z.string().refine((v) => !isNaN(Number(v))) }),
  },
  middleware: [authorize],
  security: [
    {
      Bearer: [],
    },
  ],

  responses: {
    204: {
      description: "Deleted cart items",
    },
    403: {
      description: "User is unauthorized to delete another user's cart",
      content: {
        "application/json": {
          schema: genFailureResponse(z.literal("Not the cart of the user")),
        },
      },
    },
  },
});


export const getCart = createRoute({
  tags: ["Cart Managment"],
  method: "get",
  path: "/",
  middleware: [authorize],
  security: [
    { Bearer: [] }
  ],
  responses: {
    200: {
      description: "Gets cart data",
      // content: {
      //   "application/json": {
      //     schema: CartSchema
      //   }
      // }
    }
  }
})

