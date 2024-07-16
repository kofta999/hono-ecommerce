import { OpenAPIHono } from "@hono/zod-openapi";
import { createOrderRoute } from "./doc";
import { Env } from "../../shared/types/Env";
import { db } from "../../shared/db";

const app = new OpenAPIHono<Env>()


app.openapi(createOrderRoute, async (c) => {
  // Get user cart
  // get cart items
  // loop over every item and decrease it's value
  // create an order with the cart items and address etc
  // so make the address id to be passed too
  // then return the order
  // empty cart
  // and decrease quantity
  const { uid } = c.var.user;

  const cart = await db.cart.findUnique({
    where: {
      userId: uid,
    },
    include: {
      cartItems: true
    }
  });

  if (!cart) {
    return c.json(
      {
        success: false,
        message: "Not found",
        cause: "This user does not have a cart",
      },
      404
    );
  }

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
})
