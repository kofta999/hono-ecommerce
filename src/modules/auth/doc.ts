import { createRoute, z } from "@hono/zod-openapi";
import { loginSchema, refreshSchema, registerSchema } from "./schemas";
import { genSuccessResponse } from "../../shared/utils";

export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: { content: { "application/json": { schema: registerSchema } } },
  },
  responses: {
    200: {
      description: "Creates a user successfully and sends a verification email",
      content: {
        "application/json": {
          schema: genSuccessResponse(
            z.object({
              userId: z.number(),
            })
          ),
        },
      },
    },
  },
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: { content: { "application/json": { schema: loginSchema } } },
  },
  responses: {
    200: {
      description: "Logins user successfully and returns tokens",
      content: {
        "application/json": {
          schema: genSuccessResponse(
            z.object({
              access_token: z.string(),
              refresh_token: z.string(),
            })
          ),
        },
      },
    },
    401: {
      description: "Invalid credentials",
    },
  },
});

export const refreshRoute = createRoute({
  method: "post",
  path: "/refresh",
  request: {
    body: { content: { "application/json": { schema: refreshSchema } } },
  },
  responses: {
    200: {
      description: "Returns a new access token",
      content: {
        "application/json": {
          schema: genSuccessResponse(
            z.object({
              accessToken: z.string(),
              refreshToken: z.string(),
            })
          ),
        },
      },
    },
  },
});
