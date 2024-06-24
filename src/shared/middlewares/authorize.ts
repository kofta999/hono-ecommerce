import { createMiddleware } from "hono/factory";
import { Env } from "../types/Env";
import { firebaseAdmin } from "../../firebase";

export const authorize = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header()["authorization"];

  if (!authHeader) {
    return c.json(
      {
        success: false,
        message: "Auth header is not provided",
      },
      401
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return c.json(
      {
        success: false,
        message: "JWT token is not provided",
      },
      401
    );
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    c.set("user", decodedToken);
    return next();
  } catch (error) {
    console.error(error);

    return c.json(
      {
        success: false,
        message: "Invalid JWT token",
      },
      401
    );
  }
});
