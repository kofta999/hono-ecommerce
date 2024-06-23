import { Size } from "@prisma/client";

export type ProductResponse = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sizes: Size[];
  colors: string[];

  rate: number;
  discountedPrice?: number;
  quantity?: number;
  categoryId: number;
};
