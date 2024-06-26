import { OpenAPIHono } from "@hono/zod-openapi";
import { addAddressRoute, getAddressesRoute, getUserRoute } from "./doc";
import { Env } from "../../shared/types/Env";
import { db } from "../../shared/db";

const app = new OpenAPIHono<Env>();

app.openapi(getUserRoute, async (c) => {
  const { uid } = c.var.user;

  const user = await db.user.findUnique({
    where: { firebaseId: uid },
    select: {
      firebaseId: true,
      name: true,
    },
  });

  if (!user) {
    return c.json(
      { success: false, message: "Not found", cause: "User not found" },
      404
    );
  }

  return c.json(
    {
      success: true,
      message: "Fetched user",
      data: {
        id: user.firebaseId,
        name: user.name,
      },
    },
    200
  );
});

app.openapi(addAddressRoute, async (c) => {
  const address = c.req.valid("json");

  const { uid } = c.var.user;

  const { id } = await db.userAddress.create({
    data: {
      ...address,
      userId: uid,
    },
  });

  return c.json(
    {
      success: true,
      message: "Added address",
      data: { id },
    },
    200
  );
});

app.openapi(getAddressesRoute, async (c) => {
  const { uid } = c.var.user;

  const addresses = await db.userAddress.findMany({
    where: { userId: uid },
  });

  return c.json(
    {
      success: true,
      message: "Fetched all addresses",
      data: { addresses: addresses ? addresses : [] },
    },
    200
  );
});

export default app;
