export type ProductResponse = {
  name: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  quantity?: number;
  category: string;
};
