import { createRoute } from "@hono/zod-openapi";
import { loginSchema, refreshSchema, registerSchema } from "./schemas";

export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: { content: { "application/json": { schema: registerSchema } } },
  },
  responses: {
    200: {
      description: "Creates a user successfully and sends a verification email",
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
    },
  },
});
