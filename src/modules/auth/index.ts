import { Hono } from "hono";
import { zValidator } from "../../shared/zValidator";
import { loginSchema, registerSchema } from "./schemas";
import { db } from "../../shared/db";
import { Response } from "../../shared/types/Response";
import { randomBytes } from "crypto";
import { sign } from "hono/jwt";
import { JwtPayload } from "./types";

const app = new Hono();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const parsedUser = c.req.valid("json");

  const isUserExists =
    (await db.user.count({
      where: {
        OR: [{ email: parsedUser.email }, { username: parsedUser.username }],
      },
    })) > 0;

  if (isUserExists) {
    return c.json<Response, 409>({
      success: false,
      message: "User already exists, please log in instead",
    });
  }

  const hashedPassword = await Bun.password.hash(parsedUser.password);

  const { id } = await db.user.create({
    data: { ...parsedUser, password: hashedPassword },
    select: { id: true },
  });

  return c.json<Response, 200>({
    success: true,
    message: "User created successfully",
    data: { userId: id },
  });
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const existingUser = await db.user.findFirst({
    where: { email },
    select: { id: true, password: true, username: true },
  });

  if (!existingUser) {
    return c.json<Response, 401>({
      success: false,
      message: "Invalid credentials",
      cause: "DEBUG, user not found",
    });
  }

  const isValidPassword = await Bun.password.verify(
    password,
    existingUser.password
  );

  if (!isValidPassword) {
    return c.json<Response, 401>({
      success: false,
      message: "Invalid password",
    });
  }

  const refreshToken = randomBytes(64).toString("hex");

  const payload: JwtPayload = {
    id: existingUser.id,
    username: existingUser.username,
  };

  const accessToken = await sign(
    { ...payload, exp: Date.now() * 60 * 60 * 24, iat: Date.now() },
    process.env.JWT_SECRET
  );

  await db.user.update({
    where: { email },
    data: { refreshToken },
    select: null,
  });

  console.log(refreshToken, accessToken);

  return c.json<Response, 200>({
    success: true,
    message: "Logged in successfully",
    data: {
      username: existingUser.username,
      accessToken,
      refreshToken,
    },
  });
});

export default app;
