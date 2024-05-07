type SuccessResponse = {
  success: true;
  message: string;
  data: unknown;
  cause?: never;
};

type FailureResponse = {
  success: false;
  message: string;
  data?: never;
  cause?: unknown;
};

export type Response = SuccessResponse | FailureResponse;
