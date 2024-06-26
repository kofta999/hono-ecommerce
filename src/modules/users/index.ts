import { OpenAPIHono } from "@hono/zod-openapi";
import {
  addAddressRoute,
  deleteAddressRoute,
  getAddressesRoute,
  getUserRoute,
} from "./doc";
import { Env } from "../../shared/types/Env";
import { db } from "../../shared/db";
import { Prisma } from "@prisma/client";

// TODO: Add edit address

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

app.openapi(deleteAddressRoute, async (c) => {
  const { uid } = c.var.user;
  const id = parseInt(c.req.param("id"));

  try {
    await db.userAddress.delete({
      where: {
        id,
        userId: uid,
      },
    });

    return c.json({}, 204);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return c.json(
          {
            success: false,
            message: "Unauthorized",
            cause: "User is unauthorized to do this action",
          },
          403
        );
      }
    }

    throw e;
  }
});

export default app;
