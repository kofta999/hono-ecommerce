import { logger } from "hono/logger";
import authRouter from "./modules/auth";
import productsRouter from "./modules/products";
import categoriesRouter from "./modules/categories";
import { errorHandler } from "./shared/middlewares/errorHandler";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { registerRoute } from "./modules/auth/doc";

const app = new OpenAPIHono();

app.use(logger());
app.onError(errorHandler);

app.route("/auth", authRouter);
app.route("/products", productsRouter);
app.route("/categories", categoriesRouter);

app.get("/swagger", swaggerUI({ url: "/doc" }));

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "E-Commerce API",
  },
});

export default app;
