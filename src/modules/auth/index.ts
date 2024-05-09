import { Hono } from "hono";
import { zValidator } from "../../shared/zValidator";
import { loginSchema, refreshSchema, registerSchema } from "./schemas";
import { db } from "../../shared/db";
import { Response } from "../../shared/types/Response";
import { randomBytes } from "crypto";
import { jwt, sign, verify } from "hono/jwt";
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
  const hashedRefreshToken = await Bun.password.hash(refreshToken);

  const payload: JwtPayload = {
    id: existingUser.id,
    username: existingUser.username,
  };

  const accessToken = await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET
  );

  await db.user.update({
    where: { email },
    data: { refreshToken: hashedRefreshToken },
    select: null,
  });

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

app.post("/refresh", zValidator("json", refreshSchema), async (c) => {
  const { refreshToken, userId } = c.req.valid("json");

  const existingUser = await db.user.findFirst({
    where: { id: userId },
    select: { refreshToken: true, username: true },
  });

  if (!existingUser) {
    return c.json<Response, 401>({
      success: false,
      message: "Invalid credentials",
      cause: "DEBUG, user not found",
    });
  }

  if (!existingUser.refreshToken) {
    return c.json<Response, 401>({
      success: false,
      message: "User is not logged in",
    });
  }

  const isValidToken = await Bun.password.verify(
    refreshToken,
    existingUser.refreshToken
  );

  if (!isValidToken) {
    return c.json<Response, 401>({
      success: false,
      message: "Invalid refresh token",
    });
  }

  const newRefreshToken = randomBytes(64).toString("hex");
  const hashedNewRefreshToken = await Bun.password.hash(newRefreshToken);

  const payload: JwtPayload = { id: userId, username: existingUser.username };

  const newAccessToken = await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET
  );

  await db.user.update({
    where: { id: userId },
    data: { refreshToken: hashedNewRefreshToken },
    select: null,
  });

  return c.json<Response, 200>({
    success: true,
    message: "Renewed access token",
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
});

app.get("/logout", jwt({ secret: process.env.JWT_SECRET }), async (c) => {
  const payload: JwtPayload = c.get("jwtPayload");

  try {
    await db.user.update({
      where: { id: payload.id, NOT: [{ refreshToken: null }] },
      data: { refreshToken: null },
    });

    return c.json<Response, 200>({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);

    return c.json<Response, 401>({
      success: false,
      message: "Error happened while logging out",
      cause: "DEBUG, user not found or already logged out probably",
    });
  }
});

export default app;
