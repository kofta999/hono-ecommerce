import { Hono } from "hono";
import { logger } from "hono/logger";
import authRouter from "./modules/auth";
import productsRouter from "./modules/products";

const app = new Hono();

app.use(logger());
app.route("/auth", authRouter);
app.route("/products", productsRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
