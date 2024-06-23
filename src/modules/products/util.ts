export function calculateDiscountedPrice(price: number, discount: number) {
  return price - price * discount;
}

export function toInt(v: string | undefined): number | undefined;
export function toInt(v: string | undefined, def: number): number;

export function toInt(v: string | undefined, def?: number): number | undefined {
  return v ? parseInt(v, 10) : def;
}
