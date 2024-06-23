import { db } from "../../shared/db";
import { calculatePagination, r } from "../../shared/utils";
import { ProductResponse } from "./types";
import { calculateDiscountedPrice } from "./util";
import { zValidator } from "../../shared/middlewares/zValidator";
import { app, LOW_PRODUCT_QUANTITY } from ".";

app.get("/", zValidator("query", productsQuerySchema), async (c) => {
  const { } = ;



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
      name, price, category, imageUrl, discount: { active, discountPercent }, quantity,
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
