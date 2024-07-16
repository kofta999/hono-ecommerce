import { createRoute } from "@hono/zod-openapi";
import { authorize } from "../../shared/middlewares/authorize";

export const createOrderRoute = createRoute({
  tags: ["Cart Management"],
  middleware: [authorize],
  method: "post",
  path: "/order",
  security: [
    { Bearer: [] }
  ],
  responses: {
    201: {
      description: "Order created successfully"
    }
  }
})

