import { Hono } from "hono";
import authRouter from "./modules/auth";

const app = new Hono();

app.route("/auth", authRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
