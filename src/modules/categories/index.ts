import { Hono } from "hono";
import { db } from "../../shared/db";
import { r } from "../../shared/utils";

const app = new Hono();

app.get("/", async (c) => {
  const categories = await db.productCategory.findMany();

  return c.json(
    r({
      success: true,
      message: "Fetched categories successfully",
      data: {
        categories,
      },
    })
  );
});

export default app;
