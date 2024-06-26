import { Decimal } from "@prisma/client/runtime/library";
import { db } from "../../shared/db";
import { SortEnum } from "./schemas";
import { Product } from "./types";
import { LOW_PRODUCT_QUANTITY } from ".";

export function calculateDiscountedPrice(price: number, discount: number) {
  return price - price * discount;
}

export function toInt(v: string | undefined): number | undefined;
export function toInt(v: string | undefined, def: number): number;

export function toInt(v: string | undefined, def?: number): number | undefined {
  return v ? parseInt(v, 10) : def;
}

export function parseSort(sort: SortEnum | undefined):
  | {
      updatedAt?: "desc";
      price?: "desc" | "asc";
    }
  | undefined {
  switch (sort) {
    case "date-desc":
      return {
        updatedAt: "desc",
      };

    case "price-asc":
      return {
        price: "asc",
      };

    case "price-desc":
      return {
        price: "desc",
      };

    default:
      return undefined;
  }
}

export function calculateAverageRate(reviews: { rate: number }[]) {
  const average =
    reviews.reduce((prev, curr) => prev + curr.rate, 0) / reviews.length;

  return +average.toFixed(1);
}

type MapProduct = {
  id: number;
  name: string;
  price: Decimal;
  imageUrl: string;
  categoryId: number;
  colors?: string[];
  description?: string;
  sizes?: any;
  reviews: { rate: number }[];
  discountPercent: number;
  quantity: number;
};

export function mapProduct({
  categoryId,
  discountPercent,
  id,
  imageUrl,
  name,
  price,
  quantity,
  reviews,
  colors,
  description,
  sizes,
}: MapProduct) {
  const rate = calculateAverageRate(reviews);

  const mappedProduct: Product = {
    name,
    price: price.toNumber(),
    imageUrl,
    categoryId,
    id,
    rate,
    colors,
    description,
    sizes,
  };

  mappedProduct.discountedPrice = calculateDiscountedPrice(
    price.toNumber(),
    discountPercent
  );

  if (quantity && quantity <= LOW_PRODUCT_QUANTITY) {
    mappedProduct.quantity = quantity;
  }

  return mappedProduct;
}
