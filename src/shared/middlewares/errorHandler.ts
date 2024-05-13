import { ErrorHandler } from "hono";
import { r } from "../utils";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err.message, err.cause);

  return c.json(
    r({
      success: false,
      message: "Internal Server Error",
    }),
    500
  );
};
