import { OpenAPIHono } from "@hono/zod-openapi";
import { mutateCart, emptyCart } from "./doc";
import { Env } from "../../shared/types/Env";
import { db } from "../../shared/db";

const app = new OpenAPIHono<Env>();

app.openapi(mutateCart, async (c) => {
  const { uid } = c.var.user;
  const { productId, quantity, type } = c.req.valid("json");

  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product) {
    return c.json(
      { success: false, message: "Not found", cause: "Product not found" },
      404
    );
  }

  let op;

  switch (type) {
    case "inc": {
      op = { increment: quantity };
      break;
    }

    case "dec": {
      op = { decrement: quantity };
      break;
    }

    case "del": {
      op = { set: 0 };
    }
  }

  const { id } = await db.cart.upsert({
    create: {
      userId: uid,
      cartItems: { create: { productId, quantity } },
    },
    where: {
      userId: uid,
    },
    update: {
      cartItems: {
        upsert: {
          where: { productId },
          create: { productId, quantity },
          update: { quantity: op },
        },
      },
    },
  });

  return c.json(
    {
      success: true,
      message: "Updated Cart",
      data: {
        cartId: id,
      },
    },
    200
  );
});

app.openapi(emptyCart, async (c) => {
  const { uid } = c.var.user;
  const id = parseInt(c.req.param("id"));

  const cart = await db.cart.findUnique({
    where: {
      userId: uid,
      id,
    },
  });

  if (!cart) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        cause: "Not the cart of the user",
      },
      403
    );
  }

  await db.cartItem.deleteMany({ where: { cartId: id } });
  return c.json({}, 204);
});

export default app;
