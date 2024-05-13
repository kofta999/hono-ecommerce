import { Hono } from "hono";
import { logger } from "hono/logger";
import authRouter from "./modules/auth";
import productsRouter from "./modules/products";
import { errorHandler } from "./shared/middlewares/errorHandler";

const app = new Hono();

app.use(logger());
app.onError(errorHandler);

app.route("/auth", authRouter);
app.route("/products", productsRouter);

export default app;
