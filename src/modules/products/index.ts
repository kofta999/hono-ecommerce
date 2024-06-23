import { Hono } from "hono";
import { db } from "../../shared/db";
import { calculatePagination, r } from "../../shared/utils";
import { ProductResponse } from "./types";
import { calculateDiscountedPrice, parseSort, toInt } from "./util";
import { authorize } from "../../shared/middlewares/authorize";
import { zValidator } from "../../shared/middlewares/zValidator";
import { productsQuerySchema } from "./schemas";

const LOW_PRODUCT_QUANTITY = 10;

const app = new Hono();

app.get("/", zValidator("query", productsQuerySchema), async (c) => {
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
      category: { select: { name: true } },
      discount: { select: { discountPercent: true, active: true } },
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
