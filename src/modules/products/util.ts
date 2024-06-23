import { SortEnum } from "./schemas";

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
    // case "review-desc":
    // TODO:

    default:
      return undefined;
  }
}

export function calculateAverageRate(reviews: { rate: number }[]) {
  const average =
    reviews.reduce((prev, curr) => prev + curr.rate, 0) / reviews.length;

  return +average.toFixed(1);
}
