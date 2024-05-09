import { Hono } from "hono";
import { logger } from "hono/logger";
import authRouter from "./modules/auth";

const app = new Hono();

app.use(logger());
app.route("/auth", authRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
