import { Hono } from "hono";
import { db } from "../../shared/db";
import { calculatePagination, r } from "../../shared/utils";
import { ProductResponse } from "./types";
import { calculateDiscountedPrice } from "./util";
import { authorize } from "../../shared/middlewares/authorize";

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
      category: { select: { name: true } },
      discount: { select: { discountPercent: true, active: true } },
    },
  });

  const mappedProds = products.map(
    ({
      name,
      price,
      category,
      imageUrl,
      discount: { active, discountPercent },
      quantity,
    }): ProductResponse => {
      const productRes: ProductResponse = {
        name,
        price: price.toNumber(),
        imageUrl,
        category: category.name,
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

app.get("/:id", async (c) => {
  const productId = parseInt(c.req.param("id"));

  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product) {
    return c.json(r({ success: false, message: "Product not found" }), 404);
  }

  return c.json(
    r({
      success: true,
      message: "Fetched product successfully",
      data: {
        product,
      },
    })
  );
});

export default app;
