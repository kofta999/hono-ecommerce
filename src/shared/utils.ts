import { Pagination } from "./types/Pagination";
import { Response } from "./types/Response";

export function r<T>(res: Response<T>): Response<T> {
  return res;
}

export function calculatePagination(
  page: number,
  total: number,
  perPage: number
): Pagination {
  return {
    page,
    perPage,
    total,
    hasNextPage: page * perPage < total,
    hasPreviousPage: page > 1,
  };
}
