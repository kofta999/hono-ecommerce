import { createMiddleware } from "hono/factory";
import { Env } from "../types/Env";
import { Response } from "../types/Response";
import { verify } from "hono/jwt";
import { JwtPayload } from "../../modules/auth/types";

export const authenticate = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header()["authorization"];

  if (!authHeader) {
    return c.json<Response, 401>(
      {
        success: false,
        message: "Auth header is not provided",
      },
      401
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return c.json<Response, 401>(
      {
        success: false,
        message: "JWT token is not provided",
      },
      401
    );
  }

  try {
    const { id, username }: JwtPayload = await verify(
      token,
      process.env.JWT_SECRET
    );

    c.set("user", { id, username });

    return next();
  } catch (error) {
    console.error(error);

    return c.json<Response, 401>(
      {
        success: false,
        message: "Invalid JWT token",
      },
      401
    );
  }
});
