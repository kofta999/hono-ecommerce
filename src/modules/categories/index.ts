import { Hono } from "hono";
import { db } from "../../shared/db";

const app = new Hono();

app.get("/", async (c) => {
  const categories = await db.productCategory.findMany();

  return c.json({
    success: true,
    message: "Fetched categories successfully",
    data: {
      categories,
    },
  });
});

export default app;
