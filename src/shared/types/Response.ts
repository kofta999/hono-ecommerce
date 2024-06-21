import { Pagination } from "./Pagination";

type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
  pagination?: Pagination;
  cause?: never;
};

type FailureResponse<T> = {
  success: false;
  message: string;
  data?: never;
  cause?: T;
};

export type Response<T> = SuccessResponse<T> | FailureResponse<T>;
