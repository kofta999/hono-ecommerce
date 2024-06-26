import { db } from "../../shared/db";
import { calculatePagination } from "../../shared/utils";
import { Product } from "./types";
import {
  calculateAverageRate,
  calculateDiscountedPrice,
  mapProduct,
  parseSort,
  toInt,
} from "./util";
import { OpenAPIHono } from "@hono/zod-openapi";
import { getProductRoute, getProductsRoute } from "./doc";

export const LOW_PRODUCT_QUANTITY = 10;

const app = new OpenAPIHono();

app.openapi(getProductsRoute, async (c) => {
  const query = c.req.valid("query");

  const q = query.q;
  const sort = query.sort;
  const page = toInt(query.page, 1);
  const perPage = toInt(query.perPage, 10);
  const categoryId = toInt(query.categoryId);
  const minPrice = toInt(query.minPrice);
  const maxPrice = toInt(query.maxPrice);

  const orderBy = parseSort(sort);
  const productsCount = await db.product.count();

  const products = await db.product.findMany({
    take: perPage,
    skip: perPage * (page - 1),
    include: {
      category: { select: { id: true } },
      reviews: { select: { rate: true } },
    },
    where: {
      categoryId: categoryId,
      name: {
        contains: q,
        mode: "insensitive",
      },
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    },
    orderBy,
  });

  let mappedProds = products.map(mapProduct);

  if (sort === "review-desc") {
    mappedProds = mappedProds.sort((a, b) => b.rate - a.rate);
  }

  return c.json({
    success: true,
    message: "Fetched products",
    data: {
      products: mappedProds,
    },
    pagination: calculatePagination(page, productsCount, perPage),
  });
});

app.openapi(getProductRoute, async (c) => {
  const productId = parseInt(c.req.param("id"));

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { id: true } },
      reviews: true,
    },
  });

  if (!product) {
    return c.json(
      {
        success: false,
        message: "Product not found",
        cause: "Product was not found in the DB",
      },
      404
    );
  }

  const mappedProduct = mapProduct(product);

  return c.json({
    success: true,
    message: "Fetched product successfully",
    data: {
      product: mappedProduct,
    },
  });
});

export default app;
