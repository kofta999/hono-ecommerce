import { createRoute, z } from "@hono/zod-openapi";
import { addAddressSchema, getAddressSchema, getUserSchema } from "./schema";
import { authorize } from "../../shared/middlewares/authorize";
import { genFailureResponse, genSuccessResponse } from "../../shared/utils";

export const getUserRoute = createRoute({
  method: "get",
  path: "/",
  middleware: [authorize],
  responses: {
    200: {
      description: "Returns information about the user",
      content: {
        "application/json": {
          schema: genSuccessResponse(getUserSchema),
        },
      },
    },
    404: {
      description: "User was not found in the DB",
      content: {
        "application/json": {
          schema: genFailureResponse(z.literal("User not found")),
        },
      },
    },
  },
});

export const addAddressRoute = createRoute({
  method: "post",
  path: "/address",
  middleware: [authorize],
  request: {
    body: {
      content: {
        "application/json": { schema: addAddressSchema },
      },
    },
  },
  responses: {
    200: {
      description: "The operation succeeded",
      content: {
        "application/json": {
          schema: genSuccessResponse(z.object({ id: z.number() })),
        },
      },
    },
  },
});

export const getAddressesRoute = createRoute({
  method: "get",
  path: "/address",
  middleware: [authorize],
  responses: {
    200: {
      description: "Returns all addresses for the user",
      content: {
        "application/json": {
          schema: genSuccessResponse(
            z.object({ addresses: z.array(getAddressSchema) })
          ),
        },
      },
    },
  },
});
