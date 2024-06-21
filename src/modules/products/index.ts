import { Hono } from "hono";
import { db } from "../../shared/db";
import { calculatePagination, r } from "../../shared/utils";
import { ProductResponse } from "./types";
import { calculateDiscountedPrice } from "./util";
import { authorize } from "../../shared/middlewares/authorize";

const LOW_PRODUCT_QUANTITY = 10;

const app = new Hono();

app.get("/", authorize, async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const perPage = parseInt(c.req.query("perPage") || "10");

  const productsCount = await db.product.count();
  const products = await db.product.findMany({
    take: perPage,
    skip: perPage * (page - 1),
    include: {
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
      discount: { select: { discountPercent: true, active: true } },
    },
  });

  const mappedProds = products.map(
    ({
      title,
      price,
      category: { name },
      discount: { active, discountPercent },
      inventory: { quantity },
    }): ProductResponse => {
      const productRes: ProductResponse = {
        title,
        price: price.toNumber(),
        category: name,
      };

      if (active) {
        productRes.discountedPrice = calculateDiscountedPrice(
          price.toNumber(),
          discountPercent.toNumber()
        );
      }

      if (quantity <= LOW_PRODUCT_QUANTITY) {
        productRes.quantity = quantity;
      }

      return productRes;
    }
  );

  return c.json(
    r({
      success: true,
      message: "Fetched products",
      data: {
        products: mappedProds,
      },
      pagination: calculatePagination(page, productsCount, perPage),
    })
  );
});

export default app;
