import { Hono } from "hono";
import { db } from "../../shared/db";
import { calculatePagination, r } from "../../shared/utils";
import { ProductResponse } from "./types";
import { calculateDiscountedPrice } from "./util";

const LOW_PRODUCT_QUANTITY = 10;

const app = new Hono();

app.get("/", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const perPage = parseInt(c.req.query("perPage") || "10");

  const productsCount = await db.product.count();
  const products = await db.product.findMany({
    take: perPage,
    skip: perPage * (page - 1),
    include: {
      Category: { select: { name: true } },
      Inventory: { select: { quantity: true } },
      Discount: { select: { discountPercent: true, active: true } },
    },
  });

  const mappedProds = products.map(
    ({
      title,
      price,
      Category: { name },
      Discount: { active, discountPercent },
      Inventory: { quantity },
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
