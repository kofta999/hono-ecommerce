import { ErrorHandler } from "hono";

// Improve error handler
export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err.message, err.cause);

  return c.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    500
  );
};
