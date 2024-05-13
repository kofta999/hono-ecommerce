import { Hono } from "hono";
import { zValidator } from "../../shared/middlewares/zValidator";
import { loginSchema, refreshSchema, registerSchema } from "./schemas";
import { db } from "../../shared/db";
import { randomBytes } from "crypto";
import { sign } from "hono/jwt";
import { JwtPayload } from "./types";
import { authenticate } from "../../shared/middlewares/authenticate";
import { r } from "../../shared/utils";

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
    return c.json(
      r({
        success: false,
        message: "User already exists, please log in instead",
      }),
      409
    );
  }

  const hashedPassword = await Bun.password.hash(parsedUser.password);

  const { id } = await db.user.create({
    data: { ...parsedUser, password: hashedPassword },
    select: { id: true },
  });

  return c.json(
    r({
      success: true,
      message: "User created successfully",
      data: { userId: id },
    })
  );
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const existingUser = await db.user.findFirst({
    where: { email },
    select: { id: true, password: true, username: true },
  });

  if (!existingUser) {
    return c.json(
      r({
        success: false,
        message: "Invalid credentials",
        cause: "DEBUG, user not found",
      }),
      401
    );
  }

  const isValidPassword = await Bun.password.verify(
    password,
    existingUser.password
  );

  if (!isValidPassword) {
    return c.json(
      r({
        success: false,
        message: "Invalid password",
      }),
      401
    );
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

  return c.json(
    r({
      success: true,
      message: "Logged in successfully",
      data: {
        username: existingUser.username,
        accessToken,
        refreshToken,
      },
    })
  );
});

app.post("/refresh", zValidator("json", refreshSchema), async (c) => {
  const { refreshToken, userId } = c.req.valid("json");

  const existingUser = await db.user.findFirst({
    where: { id: userId },
    select: { refreshToken: true, username: true },
  });

  if (!existingUser) {
    return c.json(
      r({
        success: false,
        message: "Invalid credentials",
        cause: "DEBUG, user not found",
      }),
      401
    );
  }

  if (!existingUser.refreshToken) {
    return c.json(
      r({
        success: false,
        message: "User is not logged in",
      }),
      401
    );
  }

  const isValidToken = await Bun.password.verify(
    refreshToken,
    existingUser.refreshToken
  );

  if (!isValidToken) {
    return c.json(
      r({
        success: false,
        message: "Invalid refresh token",
      }),
      401
    );
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

  return c.json(
    r({
      success: true,
      message: "Renewed access token",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    })
  );
});

app.get("/logout", authenticate, async (c) => {
  const { id } = c.get("user");

  try {
    await db.user.update({
      where: { id: id, NOT: [{ refreshToken: null }] },
      data: { refreshToken: null },
    });

    return c.json(
      r({
        success: true,
        message: "Logged out successfully",
      })
    );
  } catch (error) {
    return c.json(
      r({
        success: false,
        message: "Error happened while logging out",
        cause: "DEBUG, user not found or already logged out probably",
      }),
      401
    );
  }
});

export default app;
